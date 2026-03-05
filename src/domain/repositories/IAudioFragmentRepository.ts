import type { AudioFragment } from "@prisma/client";

/**
 * Repositorio de fragmentos de audio (Fase 2.3).
 * Listado por conversación y upsert por (conversation_id, sequence_index).
 */
export interface IAudioFragmentRepository {
  /**
   * Lista los fragmentos de una conversación ordenados por sequence_index.
   */
  listByConversationId(conversationId: number): Promise<AudioFragment[]>;

  /**
   * Crea o actualiza un fragmento por (conversation_id, sequence_index).
   * Idempotente: si ya existe, actualiza recorded_at, s3_key, s3_bucket.
   */
  upsert(data: {
    conversation_id: number;
    sequence_index: number;
    recorded_at: Date;
    s3_key: string;
    s3_bucket?: string | null;
  }): Promise<AudioFragment>;
}
