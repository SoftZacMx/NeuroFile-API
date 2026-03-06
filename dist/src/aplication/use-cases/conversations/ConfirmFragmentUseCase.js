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
exports.ConfirmFragmentUseCase = void 0;
/**
 * Registra el fragmento: publica mensaje en la cola neurofile-audio-fragments para que el worker persista.
 * No guarda en BD desde la API; el worker hace el upsert.
 */
class ConfirmFragmentUseCase {
    constructor(conversationRepository, sqsService) {
        this.conversationRepository = conversationRepository;
        this.sqsService = sqsService;
    }
    execute(conversationId, userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversation = yield this.conversationRepository.getById(conversationId);
            if (!conversation) {
                return { error: "NOT_FOUND", statusCode: 404 };
            }
            if (conversation.user_id !== userId) {
                return { error: "FORBIDDEN", statusCode: 403 };
            }
            const queueUrl = this.sqsService.getQueueUrl("audio-fragments");
            yield this.sqsService.sendMessage(queueUrl, {
                conversationId,
                sequenceIndex: data.sequenceIndex,
                recordedAt: data.recordedAt,
                s3Key: data.s3Key,
            });
            return { ok: true };
        });
    }
}
exports.ConfirmFragmentUseCase = ConfirmFragmentUseCase;
