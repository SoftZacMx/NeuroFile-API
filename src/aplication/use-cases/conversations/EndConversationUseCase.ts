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
    await this.sqsService.sendMessage(queueUrl, { conversationId });

    return { ok: true };
  }
}
