import type { Conversation } from "@prisma/client";

/**
 * Repositorio de conversaciones (Fase 2.3).
 * Operaciones básicas para el flujo audio → expediente.
 */
export interface IConversationRepository {
  /**
   * Crea una conversación asociada a un expediente (record) y usuario.
   */
  create(data: { record_id: number; user_id: number }): Promise<Conversation>;

  /**
   * Obtiene una conversación por id, o null si no existe.
   */
  getById(id: number): Promise<Conversation | null>;

  /**
   * Obtiene una conversación por id con el record (patient_id) para el draft (Fase 6).
   */
  getByIdWithRecord(id: number): Promise<(Conversation & { record: { patient_id: number } }) | null>;

  /**
   * Marca la conversación como terminada (ended_at = now).
   */
  setEndedAt(id: number): Promise<Conversation>;

  /**
   * Actualiza el estado de transcripción (pending | transcribing | transcribed | failed).
   */
  setTranscriptionStatus(
    id: number,
    status: "pending" | "transcribing" | "transcribed" | "failed"
  ): Promise<Conversation>;

  /**
   * Guarda la transcripción completa y marca la conversación como transcribed (Fase 5.5).
   */
  setFullTranscription(id: number, fullTranscription: string): Promise<Conversation>;

  /**
   * Marca la conversación como procesada por el worker summarize-map (Fase 6).
   */
  setProcessedAt(id: number): Promise<Conversation>;
}
