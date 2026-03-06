import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { IWhisperService } from "../../domain/services/IWhisperService";

/** Límite de tamaño por fragmento para la API de Whisper (25 MB). */
const WHISPER_MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

const DEFAULT_FILENAME = "audio.webm";

/**
 * Implementación del servicio de transcripción con Whisper (Fase 5.1).
 * Usa la API de OpenAI (Whisper). Requiere OPENAI_API_KEY en el entorno.
 */
export class WhisperServiceImpl implements IWhisperService {
  private readonly client: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.OPENAI_API_KEY;
    if (!key?.trim()) {
      throw new Error(
        "WhisperServiceImpl: OPENAI_API_KEY es requerido para transcripción."
      );
    }
    this.client = new OpenAI({ apiKey: key.trim() });
  }

  async transcribe(
    audioBuffer: Buffer,
    options?: { filename?: string }
  ): Promise<string> {
    if (audioBuffer.length > WHISPER_MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `El fragmento de audio supera el límite de ${WHISPER_MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`
      );
    }

    const filename = options?.filename?.trim() || DEFAULT_FILENAME;
    const mimeType = this.getMimeTypeFromFilename(filename);

    const file = await toFile(audioBuffer, filename, { type: mimeType });

    const response = await this.client.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "text",
    });

    return typeof response === "string" ? response : (response as { text: string }).text;
  }

  private getMimeTypeFromFilename(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    const mime: Record<string, string> = {
      webm: "audio/webm",
      mp3: "audio/mpeg",
      mp4: "audio/mp4",
      mpeg: "audio/mpeg",
      mpga: "audio/mpeg",
      m4a: "audio/mp4",
      ogg: "audio/ogg",
      wav: "audio/wav",
      flac: "audio/flac",
    };
    return mime[ext ?? ""] ?? "audio/webm";
  }
}
