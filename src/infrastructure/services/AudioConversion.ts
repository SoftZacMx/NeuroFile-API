import { PassThrough, Readable } from "stream";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

if (typeof ffmpegStatic === "string") {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

/**
 * Convierte un buffer de audio WebM (p. ej. Opus desde MediaRecorder) a MP3
 * para compatibilidad con la API de Whisper.
 */
export function convertWebmToMp3(webmBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const inputStream = Readable.from(webmBuffer);
    const chunks: Buffer[] = [];
    const outputStream = new PassThrough();
    outputStream.on("data", (chunk: Buffer) => chunks.push(chunk));
    outputStream.on("end", () => resolve(Buffer.concat(chunks)));
    outputStream.on("error", reject);

    ffmpeg(inputStream)
      .inputFormat("webm")
      .toFormat("mp3")
      .on("error", (err: Error) => reject(err))
      .pipe(outputStream, { end: true });
  });
}

/**
 * Concatena varios buffers WebM en orden (primer fragmento con cabecera + continuaciones)
 * y convierte el resultado a MP3. Así se obtiene un único archivo válido para Whisper
 * cuando MediaRecorder emite un WebM completo solo en el primer chunk.
 */
export function concatWebmToMp3(webmBuffers: Buffer[]): Promise<Buffer> {
  if (webmBuffers.length === 0) {
    return Promise.reject(new Error("concatWebmToMp3: no hay buffers"));
  }
  const combined = Buffer.concat(webmBuffers);
  return convertWebmToMp3(combined);
}
