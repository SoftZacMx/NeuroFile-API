import type { ExpedientDraft } from "@prisma/client";

/**
 * Repositorio de borradores de expediente generados por LLM (Fase 6).
 * Un draft por conversación (conversation_id único).
 */
export interface IExpedientDraftRepository {
  /**
   * Crea un borrador para una conversación. Si ya existe, reemplaza el payload (upsert).
   */
  upsert(data: {
    conversation_id: number;
    record_id: number;
    payload: Record<string, unknown>;
  }): Promise<ExpedientDraft>;

  /**
   * Obtiene el borrador por id de conversación, o null.
   */
  getByConversationId(conversationId: number): Promise<ExpedientDraft | null>;
}
