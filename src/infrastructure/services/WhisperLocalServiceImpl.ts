import { IWhisperService } from "../../domain/services/IWhisperService";

const DEFAULT_TIMEOUT_MS = 300_000; // 5 min para audios largos
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

/**
 * Implementación de transcripción usando un servicio Whisper local (microservicio HTTP).
 * Requiere WHISPER_SERVICE_URL (ej. http://localhost:8000).
 */
export class WhisperLocalServiceImpl implements IWhisperService {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(baseUrl?: string, timeoutMs?: number) {
    const url = (baseUrl ?? process.env.WHISPER_SERVICE_URL ?? "").replace(/\/$/, "");
    if (!url) {
      throw new Error(
        "WhisperLocalServiceImpl: WHISPER_SERVICE_URL es requerido (ej. http://localhost:8000)."
      );
    }
    this.baseUrl = url;
    this.timeoutMs = timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async transcribe(
    audioBuffer: Buffer,
    options?: { filename?: string }
  ): Promise<string> {
    if (audioBuffer.length > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `El fragmento de audio supera el límite de ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`
      );
    }

    const filename = options?.filename?.trim() || "audio.webm";
    const mimeType = this.getMimeTypeFromFilename(filename);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/transcribe`, {
        method: "POST",
        headers: {
          "Content-Type": mimeType,
          "Content-Length": String(audioBuffer.length),
        },
        body: audioBuffer,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(
          `Whisper local: ${res.status} ${res.statusText}${detail ? ` - ${detail}` : ""}`
        );
      }

      const json = (await res.json()) as { text?: string };
      return typeof json.text === "string" ? json.text : "";
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error) throw err;
      throw new Error(String(err));
    }
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
