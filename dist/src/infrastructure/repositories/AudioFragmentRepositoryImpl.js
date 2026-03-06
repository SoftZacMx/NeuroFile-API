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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioFragmentRepositoryImpl = void 0;
const prisma_client_1 = __importDefault(require("../database/prisma/prisma.client"));
class AudioFragmentRepositoryImpl {
    listByConversationId(conversationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_client_1.default.audioFragment.findMany({
                where: { conversation_id: conversationId },
                orderBy: { sequence_index: "asc" },
            });
        });
    }
    upsert(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            return prisma_client_1.default.audioFragment.upsert({
                where: {
                    conversation_id_sequence_index: {
                        conversation_id: data.conversation_id,
                        sequence_index: data.sequence_index,
                    },
                },
                create: {
                    conversation_id: data.conversation_id,
                    sequence_index: data.sequence_index,
                    recorded_at: data.recorded_at,
                    s3_key: data.s3_key,
                    s3_bucket: (_a = data.s3_bucket) !== null && _a !== void 0 ? _a : null,
                },
                update: {
                    recorded_at: data.recorded_at,
                    s3_key: data.s3_key,
                    s3_bucket: (_b = data.s3_bucket) !== null && _b !== void 0 ? _b : undefined,
                },
            });
        });
    }
}
exports.AudioFragmentRepositoryImpl = AudioFragmentRepositoryImpl;
