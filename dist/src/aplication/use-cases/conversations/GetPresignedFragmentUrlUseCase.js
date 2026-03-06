"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPresignedFragmentUrlUseCase = void 0;
const PRESIGN_EXPIRES_SECONDS = 900; // 15 min
/**
 * Genera presigned URL (PUT) para que el cliente suba un fragmento de audio.
 * Valida que la conversación exista, no esté terminada y pertenezca al usuario.
 */
class GetPresignedFragmentUrlUseCase {
    constructor(conversationRepository, s3Service) {
        this.conversationRepository = conversationRepository;
        this.s3Service = s3Service;
    }
    execute(conversationId, userId, sequenceIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversation = yield this.conversationRepository.getById(conversationId);
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
            const uploadUrl = yield this.s3Service.getPresignedPutUrl(s3Key, PRESIGN_EXPIRES_SECONDS);
            const expiresAt = new Date(Date.now() + PRESIGN_EXPIRES_SECONDS * 1000);
            return { uploadUrl, s3Key, expiresAt };
        });
    }
}
exports.GetPresignedFragmentUrlUseCase = GetPresignedFragmentUrlUseCase;
