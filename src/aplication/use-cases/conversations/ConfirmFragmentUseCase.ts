import { IConversationRepository } from "../../../domain/repositories/IConversationRepository";
import { ISqsService } from "../../../domain/services/ISqsService";

export type ConfirmFragmentResult =
  | { ok: true }
  | { error: "NOT_FOUND" | "FORBIDDEN"; statusCode: number };

/**
 * Registra el fragmento: publica mensaje en la cola neurofile-audio-fragments para que el worker persista.
 * No guarda en BD desde la API; el worker hace el upsert.
 */
export class ConfirmFragmentUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly sqsService: ISqsService
  ) {}

  async execute(
    conversationId: number,
    userId: number,
    data: { sequenceIndex: number; recordedAt: string; s3Key: string }
  ): Promise<ConfirmFragmentResult> {
    const conversation = await this.conversationRepository.getById(
      conversationId
    );

    if (!conversation) {
      return { error: "NOT_FOUND", statusCode: 404 };
    }

    if (conversation.user_id !== userId) {
      return { error: "FORBIDDEN", statusCode: 403 };
    }

    const queueUrl = this.sqsService.getQueueUrl("audio-fragments");
    await this.sqsService.sendMessage(queueUrl, {
      conversationId,
      sequenceIndex: data.sequenceIndex,
      recordedAt: data.recordedAt,
      s3Key: data.s3Key,
    });

    return { ok: true };
  }
}
