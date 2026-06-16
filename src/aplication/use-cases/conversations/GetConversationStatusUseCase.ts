import { IConversationRepository } from "../../../domain/repositories/IConversationRepository";

export interface ConversationStatus {
  /** Estado de la transcripción: pending | transcribing | transcribed | failed. */
  transcriptionStatus: string;
  /** ISO de cuando terminó el pipeline (summarize-map), o null si aún no termina. */
  processedAt: string | null;
  /** ISO de cuando se cerró la grabación, o null si sigue activa. */
  endedAt: string | null;
}

export type GetConversationStatusResult =
  | { ok: true; status: ConversationStatus }
  | { error: "NOT_FOUND" | "FORBIDDEN"; statusCode: number };

/**
 * Devuelve el estado de procesamiento de una conversación para que el frontend
 * sepa si debe seguir esperando, redirigir, o mostrar un error/aviso.
 */
export class GetConversationStatusUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(
    conversationId: number,
    userId: number
  ): Promise<GetConversationStatusResult> {
    const conversation = await this.conversationRepository.getById(
      conversationId
    );

    if (!conversation) {
      return { error: "NOT_FOUND", statusCode: 404 };
    }

    if (conversation.user_id !== userId) {
      return { error: "FORBIDDEN", statusCode: 403 };
    }

    return {
      ok: true,
      status: {
        transcriptionStatus: conversation.transcription_status,
        processedAt: conversation.processed_at
          ? conversation.processed_at.toISOString()
          : null,
        endedAt: conversation.ended_at
          ? conversation.ended_at.toISOString()
          : null,
      },
    };
  }
}
