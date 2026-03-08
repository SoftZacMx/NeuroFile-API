/**
 * Servicio que mapea una transcripción de sesión clínica a un payload de expediente (Fase 6).
 * Usa un LLM para extraer campos estructurados del texto.
 */
export interface IMapTranscriptionToExpedientService {
  /**
   * Transforma la transcripción en un objeto con los campos del expediente clínico.
   * @param transcription Texto completo de la transcripción de la sesión.
   * @param patientId ID del paciente (se incluye en el payload).
   * @returns Objeto con la forma de CreateRecordDTO (campos de texto y arrays opcionales).
   */
  mapTranscription(
    transcription: string,
    patientId: number
  ): Promise<Record<string, unknown>>;
}
