"""
Microservicio de transcripción con Whisper en local (faster-whisper).
Expone POST /transcribe: body = audio binario, respuesta { "text": "..." }.
"""
import logging
import os
import tempfile
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request

logging.basicConfig(
    level=logging.INFO,
    format="[whisper-service] %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

# Modelo cargado al arranque (evita cargar por request)
model = None
MODEL_SIZE = os.environ.get("WHISPER_MODEL_SIZE", "base")
# Idioma fijo (ej. "es" español); vacío o no definido = detección automática
WHISPER_LANGUAGE = (os.environ.get("WHISPER_LANGUAGE") or "").strip() or None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    from faster_whisper import WhisperModel
    log.info("Cargando modelo '%s'...", MODEL_SIZE)
    model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
    log.info("Modelo listo.")
    yield
    model = None


app = FastAPI(title="Whisper Local", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_SIZE}


@app.post("/transcribe")
async def transcribe(request: Request):
    if model is None:
        log.error("Petición /transcribe rechazada: modelo no cargado")
        raise HTTPException(status_code=503, detail="Model not loaded")
    body = await request.body()
    if not body:
        log.warning("Petición /transcribe con body vacío")
        raise HTTPException(status_code=400, detail="Empty body")

    size_bytes = len(body)
    content_type = request.headers.get("content-type", "")
    log.info("Recibida petición /transcribe, tamaño=%s bytes, content_type=%s", size_bytes, content_type or "(vacío)")

    suffix = ".webm"
    if "mpeg" in content_type or "mp3" in content_type:
        suffix = ".mp3"
    elif "wav" in content_type:
        suffix = ".wav"
    elif "m4a" in content_type or "mp4" in content_type:
        suffix = ".m4a"

    started = time.monotonic()
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
            f.write(body)
            path = f.name
        try:
            segments, info = model.transcribe(path, language=WHISPER_LANGUAGE)
            text = " ".join((s.text or "").strip() for s in segments).strip()
            elapsed = time.monotonic() - started
            log.info("Transcripción OK, longitud_texto=%s, tiempo_s=%.2f", len(text), elapsed)
            return {"text": text or ""}
        finally:
            os.unlink(path)
    except Exception as e:
        elapsed = time.monotonic() - started
        log.exception("Error en transcripción tras %.2fs: %s", elapsed, e)
        raise HTTPException(status_code=500, detail=str(e))
