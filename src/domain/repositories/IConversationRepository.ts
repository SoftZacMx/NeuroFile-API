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
   * Marca la conversación como terminada (ended_at = now).
   */
  setEndedAt(id: number): Promise<Conversation>;
}
