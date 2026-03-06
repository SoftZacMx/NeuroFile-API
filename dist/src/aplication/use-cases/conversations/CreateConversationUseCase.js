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
exports.CreateConversationUseCase = void 0;
/**
 * Crea una conversación para un expediente (record). Valida que el record exista y que el usuario tenga permiso (expediente del paciente del usuario).
 */
class CreateConversationUseCase {
    constructor(conversationRepository, expedientRepository) {
        this.conversationRepository = conversationRepository;
        this.expedientRepository = expedientRepository;
    }
    execute(recordId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const record = yield this.expedientRepository.getExpedient(recordId);
            if (!record || record.code) {
                return { error: "RECORD_NOT_FOUND", statusCode: 404 };
            }
            const recordWithPatient = record;
            if (((_a = recordWithPatient.patient) === null || _a === void 0 ? void 0 : _a.user_id) !== userId) {
                return { error: "FORBIDDEN", statusCode: 403 };
            }
            const conversation = yield this.conversationRepository.create({
                record_id: recordId,
                user_id: userId,
            });
            return {
                conversationId: conversation.id,
                startedAt: conversation.started_at,
            };
        });
    }
}
exports.CreateConversationUseCase = CreateConversationUseCase;
