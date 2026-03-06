import { IConversationRepository } from "../../../domain/repositories/IConversationRepository";
import { ISqsService } from "../../../domain/services/ISqsService";

export type EndConversationResult =
  | { ok: true }
  | { error: "NOT_FOUND" | "FORBIDDEN"; statusCode: number };

/**
 * Termina una conversación: marca ended_at y publica mensaje en la cola de transcripción.
 */
export class EndConversationUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly sqsService: ISqsService
  ) {}

  async execute(
    conversationId: number,
    userId: number
  ): Promise<EndConversationResult> {
    const conversation = await this.conversationRepository.getById(
      conversationId
    );

    if (!conversation) {
      return { error: "NOT_FOUND", statusCode: 404 };
    }

    if (conversation.user_id !== userId) {
      return { error: "FORBIDDEN", statusCode: 403 };
    }

    await this.conversationRepository.setEndedAt(conversationId);

    const queueUrl = this.sqsService.getQueueUrl("transcribe-conversation");
    try {
      console.log("[api] Encolando en neurofile-transcribe-conversation. conversationId=%s url=%s", conversationId, queueUrl);
      await this.sqsService.sendMessage(queueUrl, { conversationId });
      console.log("[api] Mensaje encolado OK. conversationId=%s", conversationId);
    } catch (err) {
      console.error("[api] Error al encolar en neurofile-transcribe-conversation:", err);
      throw err;
    }

    return { ok: true };
  }
}
