# Whisper local (faster-whisper)

Microservicio HTTP para transcribir audio con Whisper en local, sin usar la API de OpenAI.

## Uso

### Con Docker

```bash
# Desde la raíz del repo NeuroFile-API
docker compose up -d whisper-service
```

Expone `http://localhost:8000`. El worker de transcripción debe tener:

- `WHISPER_PROVIDER=local`
- `WHISPER_SERVICE_URL=http://localhost:8000` (desde el host) o `http://whisper-service:8000` (desde otro contenedor).

### Sin Docker (desarrollo)

```bash
cd services/whisper-service
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

En `.env` del API:

- `WHISPER_PROVIDER=local`
- `WHISPER_SERVICE_URL=http://localhost:8000`

## Endpoints

- `GET /health` — estado y modelo cargado.
- `POST /transcribe` — body: audio binario (Content-Type opcional: audio/webm, audio/mpeg, etc.). Respuesta: `{ "text": "..." }`.

## Variables de entorno

- `WHISPER_MODEL_SIZE`: tamaño del modelo (`base`, `small`, `medium`, `large-v3`). Por defecto `base`. Modelos más grandes son más precisos pero más lentos y usan más RAM.
- `WHISPER_LANGUAGE`: idioma fijo (código ISO, ej. `es` español, `en` inglés). Si no se define o está vacío, el modelo detecta el idioma automáticamente.
