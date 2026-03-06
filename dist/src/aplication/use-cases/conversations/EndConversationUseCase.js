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
exports.EndConversationUseCase = void 0;
/**
 * Termina una conversación: marca ended_at y publica mensaje en la cola de transcripción.
 */
class EndConversationUseCase {
    constructor(conversationRepository, sqsService) {
        this.conversationRepository = conversationRepository;
        this.sqsService = sqsService;
    }
    execute(conversationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversation = yield this.conversationRepository.getById(conversationId);
            if (!conversation) {
                return { error: "NOT_FOUND", statusCode: 404 };
            }
            if (conversation.user_id !== userId) {
                return { error: "FORBIDDEN", statusCode: 403 };
            }
            yield this.conversationRepository.setEndedAt(conversationId);
            const queueUrl = this.sqsService.getQueueUrl("transcribe-conversation");
            yield this.sqsService.sendMessage(queueUrl, { conversationId });
            return { ok: true };
        });
    }
}
exports.EndConversationUseCase = EndConversationUseCase;
