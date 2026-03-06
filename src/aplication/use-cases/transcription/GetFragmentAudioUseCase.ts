import { IS3Service } from "../../../domain/services/IS3Service";

/** Límite de tamaño para fragmentos de audio (Whisper API y uso en memoria). */
const MAX_FRAGMENT_SIZE_BYTES = 25 * 1024 * 1024;

export type GetFragmentAudioResult =
  | { buffer: Buffer }
  | { error: "NOT_FOUND" | "TOO_LARGE"; statusCode: number };

/**
 * Descarga el audio de un fragmento desde S3 (Fase 5.2).
 * Dado s3Key, descarga el objeto y devuelve el buffer al llamador (worker de transcripción).
 * Valida que el tamaño no supere el límite para Whisper (25 MB).
 */
export class GetFragmentAudioUseCase {
  constructor(private readonly s3Service: IS3Service) {}

  async execute(s3Key: string): Promise<GetFragmentAudioResult> {
    if (!s3Key?.trim()) {
      return { error: "NOT_FOUND", statusCode: 404 };
    }

    let buffer: Buffer;
    try {
      buffer = await this.s3Service.getObject(s3Key.trim());
    } catch {
      return { error: "NOT_FOUND", statusCode: 404 };
    }

    if (buffer.length > MAX_FRAGMENT_SIZE_BYTES) {
      return {
        error: "TOO_LARGE",
        statusCode: 413,
      };
    }

    return { buffer };
  }
}
