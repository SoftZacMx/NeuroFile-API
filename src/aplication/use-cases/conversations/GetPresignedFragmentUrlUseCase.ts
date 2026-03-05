import { IConversationRepository } from "../../../domain/repositories/IConversationRepository";
import { IS3Service } from "../../../domain/services/IS3Service";

const PRESIGN_EXPIRES_SECONDS = 900; // 15 min

export type GetPresignedFragmentUrlResult =
  | { uploadUrl: string; s3Key: string; expiresAt: Date }
  | { error: "NOT_FOUND" | "FORBIDDEN" | "CONVERSATION_ENDED"; statusCode: number };

/**
 * Genera presigned URL (PUT) para que el cliente suba un fragmento de audio.
 * Valida que la conversación exista, no esté terminada y pertenezca al usuario.
 */
export class GetPresignedFragmentUrlUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly s3Service: IS3Service
  ) {}

  async execute(
    conversationId: number,
    userId: number,
    sequenceIndex: number
  ): Promise<GetPresignedFragmentUrlResult> {
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

    const s3Key = `conversations/${conversationId}/fragments/${sequenceIndex}.webm`;
    const uploadUrl = await this.s3Service.getPresignedPutUrl(
      s3Key,
      PRESIGN_EXPIRES_SECONDS
    );
    const expiresAt = new Date(
      Date.now() + PRESIGN_EXPIRES_SECONDS * 1000
    );

    return { uploadUrl, s3Key, expiresAt };
  }
}
