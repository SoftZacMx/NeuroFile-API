import { IConversationRepository } from "../../../domain/repositories/IConversationRepository";
import { IS3Service } from "../../../domain/services/IS3Service";
import { ISqsService } from "../../../domain/services/ISqsService";

export type UploadFragmentResult =
  | { ok: true; s3Key: string }
  | { error: "NOT_FOUND" | "FORBIDDEN" | "CONVERSATION_ENDED" | "FILE_REQUIRED"; statusCode: number };

/**
 * Flujo simplificado: el cliente envía el archivo de audio a la API.
 * La API sube a S3 y encola el mensaje para que el worker persista en BD.
 * El front solo inicia conversación, envía fragmentos (este endpoint) y termina conversación.
 */
export class UploadFragmentUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly s3Service: IS3Service,
    private readonly sqsService: ISqsService
  ) {}

  async execute(
    conversationId: number,
    userId: number,
    data: { sequenceIndex: number; recordedAt: string; fileBuffer: Buffer }
  ): Promise<UploadFragmentResult> {
    if (!data.fileBuffer || data.fileBuffer.length === 0) {
      return { error: "FILE_REQUIRED", statusCode: 400 };
    }

    const conversation = await this.conversationRepository.getById(
      conversationId
    );

    if (!conversation) {
      return { error: "NOT_FOUND", statusCode: 404 };
    }

    if (conversation.user_id !== userId) {
      return { error: "FORBIDDEN", statusCode: 403 };
    }

    if (conversation.ended_at != null) {
      return { error: "CONVERSATION_ENDED", statusCode: 400 };
    }

    const s3Key = `conversations/${conversationId}/fragments/${data.sequenceIndex}.webm`;
    await this.s3Service.putObject(s3Key, data.fileBuffer);

    const queueUrl = this.sqsService.getQueueUrl("audio-fragments");
    await this.sqsService.sendMessage(queueUrl, {
      conversationId,
      sequenceIndex: data.sequenceIndex,
      recordedAt: data.recordedAt,
      s3Key,
    });

    return { ok: true, s3Key };
  }
}
