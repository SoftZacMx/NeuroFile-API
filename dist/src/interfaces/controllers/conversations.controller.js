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
exports.confirmFragmentController = exports.getPresignedFragmentUrlController = exports.endConversationController = exports.createConversationController = void 0;
const response_helper_1 = require("../../shared/helpers/response.helper");
const CreateConversationUseCase_1 = require("../../aplication/use-cases/conversations/CreateConversationUseCase");
const EndConversationUseCase_1 = require("../../aplication/use-cases/conversations/EndConversationUseCase");
const GetPresignedFragmentUrlUseCase_1 = require("../../aplication/use-cases/conversations/GetPresignedFragmentUrlUseCase");
const ConfirmFragmentUseCase_1 = require("../../aplication/use-cases/conversations/ConfirmFragmentUseCase");
const ConversationRepositoryImpl_1 = require("../../infrastructure/repositories/ConversationRepositoryImpl");
const ExpedientsRepositoryImplementation_1 = require("../../infrastructure/repositories/ExpedientsRepositoryImplementation");
const S3ServiceImpl_1 = require("../../infrastructure/services/S3ServiceImpl");
const SqsServiceImpl_1 = require("../../infrastructure/services/SqsServiceImpl");
const conversationRepository = new ConversationRepositoryImpl_1.ConversationRepositoryImpl();
const expedientRepository = new ExpedientsRepositoryImplementation_1.ExpedientRepositoryImpl();
const sqsService = new SqsServiceImpl_1.SqsServiceImpl();
const s3Service = new S3ServiceImpl_1.S3ServiceImpl();
const createConversationUseCase = new CreateConversationUseCase_1.CreateConversationUseCase(conversationRepository, expedientRepository);
const endConversationUseCase = new EndConversationUseCase_1.EndConversationUseCase(conversationRepository, sqsService);
const getPresignedFragmentUrlUseCase = new GetPresignedFragmentUrlUseCase_1.GetPresignedFragmentUrlUseCase(conversationRepository, s3Service);
const confirmFragmentUseCase = new ConfirmFragmentUseCase_1.ConfirmFragmentUseCase(conversationRepository, sqsService);
/**
 * POST /api/conversations
 * Body: { recordId: number }
 * Crea una conversación para el expediente. El usuario debe ser el dueño del expediente (paciente del usuario).
 */
const createConversationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const recordId = typeof ((_a = req.body) === null || _a === void 0 ? void 0 : _a.recordId) === "number"
            ? req.body.recordId
            : parseInt((_b = req.body) === null || _b === void 0 ? void 0 : _b.recordId, 10);
        if (isNaN(recordId) || recordId <= 0) {
            const error = (0, response_helper_1.errorResponse)("recordId inválido o faltante", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const userId = parseInt((_d = (_c = req.user) === null || _c === void 0 ? void 0 : _c.sub) !== null && _d !== void 0 ? _d : "", 10);
        if (isNaN(userId)) {
            const error = (0, response_helper_1.errorResponse)("Usuario no identificado", 401);
            res.status(error.status_code).json(error);
            return;
        }
        const result = yield createConversationUseCase.execute(recordId, userId);
        if ("error" in result) {
            const message = result.error === "RECORD_NOT_FOUND"
                ? "Expediente no encontrado"
                : "No tiene permiso para crear conversación en este expediente";
            const error = (0, response_helper_1.errorResponse)(message, result.statusCode);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)({ conversationId: result.conversationId, startedAt: result.startedAt }, "Conversación creada");
        res.status(201).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al crear la conversación", 500);
        res.status(error.status_code).json(error);
    }
});
exports.createConversationController = createConversationController;
/**
 * POST /api/conversations/:id/end
 * Marca la conversación como terminada y encola mensaje para transcripción.
 */
const endConversationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const conversationId = parseInt(req.params.id, 10);
        if (isNaN(conversationId) || conversationId <= 0) {
            const error = (0, response_helper_1.errorResponse)("id de conversación inválido", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const userId = parseInt((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub) !== null && _b !== void 0 ? _b : "", 10);
        if (isNaN(userId)) {
            const error = (0, response_helper_1.errorResponse)("Usuario no identificado", 401);
            res.status(error.status_code).json(error);
            return;
        }
        const result = yield endConversationUseCase.execute(conversationId, userId);
        if ("error" in result) {
            const message = result.error === "NOT_FOUND"
                ? "Conversación no encontrada"
                : "No tiene permiso para terminar esta conversación";
            const error = (0, response_helper_1.errorResponse)(message, result.statusCode);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(null, "Conversación terminada");
        res.status(200).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al terminar la conversación", 500);
        res.status(error.status_code).json(error);
    }
});
exports.endConversationController = endConversationController;
/**
 * POST /api/conversations/:id/fragments
 * Body: { sequenceIndex: number, recordedAt: string (ISO) }
 * Devuelve presigned URL (PUT) para subir el fragmento de audio a S3.
 */
const getPresignedFragmentUrlController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const conversationId = parseInt(req.params.id, 10);
        if (isNaN(conversationId) || conversationId <= 0) {
            const error = (0, response_helper_1.errorResponse)("id de conversación inválido", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const sequenceIndex = typeof ((_a = req.body) === null || _a === void 0 ? void 0 : _a.sequenceIndex) === "number"
            ? req.body.sequenceIndex
            : parseInt((_b = req.body) === null || _b === void 0 ? void 0 : _b.sequenceIndex, 10);
        if (isNaN(sequenceIndex) || sequenceIndex < 0) {
            const error = (0, response_helper_1.errorResponse)("sequenceIndex inválido o faltante", 400);
            res.status(error.status_code).json(error);
            return;
        }
        if (((_c = req.body) === null || _c === void 0 ? void 0 : _c.recordedAt) == null || typeof req.body.recordedAt !== "string") {
            const error = (0, response_helper_1.errorResponse)("recordedAt inválido o faltante", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const userId = parseInt((_e = (_d = req.user) === null || _d === void 0 ? void 0 : _d.sub) !== null && _e !== void 0 ? _e : "", 10);
        if (isNaN(userId)) {
            const error = (0, response_helper_1.errorResponse)("Usuario no identificado", 401);
            res.status(error.status_code).json(error);
            return;
        }
        const result = yield getPresignedFragmentUrlUseCase.execute(conversationId, userId, sequenceIndex);
        if ("error" in result) {
            const message = result.error === "NOT_FOUND"
                ? "Conversación no encontrada"
                : result.error === "FORBIDDEN"
                    ? "No tiene permiso para esta conversación"
                    : "La conversación ya está terminada";
            const error = (0, response_helper_1.errorResponse)(message, result.statusCode);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)({
            uploadUrl: result.uploadUrl,
            s3Key: result.s3Key,
            expiresAt: result.expiresAt,
        }, "URL de subida generada");
        res.status(200).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al generar URL de subida", 500);
        res.status(error.status_code).json(error);
    }
});
exports.getPresignedFragmentUrlController = getPresignedFragmentUrlController;
/**
 * POST /api/conversations/:id/fragments/confirm
 * Body: { sequenceIndex: number, recordedAt: string (ISO), s3Key: string }
 * Encola el fragmento en neurofile-audio-fragments para que el worker lo persista.
 */
const confirmFragmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const conversationId = parseInt(req.params.id, 10);
        if (isNaN(conversationId) || conversationId <= 0) {
            const error = (0, response_helper_1.errorResponse)("id de conversación inválido", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const sequenceIndex = typeof ((_a = req.body) === null || _a === void 0 ? void 0 : _a.sequenceIndex) === "number"
            ? req.body.sequenceIndex
            : parseInt((_b = req.body) === null || _b === void 0 ? void 0 : _b.sequenceIndex, 10);
        if (isNaN(sequenceIndex) || sequenceIndex < 0) {
            const error = (0, response_helper_1.errorResponse)("sequenceIndex inválido o faltante", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const recordedAt = (_c = req.body) === null || _c === void 0 ? void 0 : _c.recordedAt;
        if (typeof recordedAt !== "string" || !recordedAt.trim()) {
            const error = (0, response_helper_1.errorResponse)("recordedAt inválido o faltante", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const s3Key = (_d = req.body) === null || _d === void 0 ? void 0 : _d.s3Key;
        if (typeof s3Key !== "string" || !s3Key.trim()) {
            const error = (0, response_helper_1.errorResponse)("s3Key inválido o faltante", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const userId = parseInt((_f = (_e = req.user) === null || _e === void 0 ? void 0 : _e.sub) !== null && _f !== void 0 ? _f : "", 10);
        if (isNaN(userId)) {
            const error = (0, response_helper_1.errorResponse)("Usuario no identificado", 401);
            res.status(error.status_code).json(error);
            return;
        }
        const result = yield confirmFragmentUseCase.execute(conversationId, userId, {
            sequenceIndex,
            recordedAt: recordedAt.trim(),
            s3Key: s3Key.trim(),
        });
        if ("error" in result) {
            const message = result.error === "NOT_FOUND"
                ? "Conversación no encontrada"
                : "No tiene permiso para esta conversación";
            const error = (0, response_helper_1.errorResponse)(message, result.statusCode);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(null, "Fragmento encolado para procesamiento");
        res.status(202).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al confirmar el fragmento", 500);
        res.status(error.status_code).json(error);
    }
});
exports.confirmFragmentController = confirmFragmentController;
