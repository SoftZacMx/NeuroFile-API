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
exports.ConversationRepositoryImpl = void 0;
const prisma_client_1 = __importDefault(require("../database/prisma/prisma.client"));
class ConversationRepositoryImpl {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_client_1.default.conversation.create({
                data: {
                    record_id: data.record_id,
                    user_id: data.user_id,
                },
            });
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_client_1.default.conversation.findUnique({
                where: { id },
            });
        });
    }
    setEndedAt(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_client_1.default.conversation.update({
                where: { id },
                data: { ended_at: new Date() },
            });
        });
    }
}
exports.ConversationRepositoryImpl = ConversationRepositoryImpl;
