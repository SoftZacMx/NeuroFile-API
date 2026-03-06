/**
 * Servicio de transcripción de audio con Whisper (Fase 5.1).
 * Recibe un buffer de audio y devuelve el texto transcrito.
 */
export interface IWhisperService {
  /**
   * Transcribe un fragmento de audio usando la API de Whisper.
   * @param audioBuffer Contenido del archivo de audio (máx. 25 MB por límite de la API).
   * @param options filename opcional para que la API detecte el formato (ej. "fragment.webm", "audio.mp3").
   * @returns Texto transcrito.
   * @throws Error si el buffer supera el tamaño máximo o si la API falla.
   */
  transcribe(
    audioBuffer: Buffer,
    options?: { filename?: string }
  ): Promise<string>;
}
