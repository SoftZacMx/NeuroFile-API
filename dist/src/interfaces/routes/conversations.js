"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const checkJWT_1 = require("../middelwares/auth/checkJWT");
const conversations_controller_1 = require("../controllers/conversations.controller");
const router = (0, express_1.Router)();
exports.router = router;
/**
 * POST /api/conversations
 * Body: { recordId: number }
 * Crea una conversación para grabar audio por fragmentos. Requiere JWT. El expediente debe pertenecer al usuario.
 */
router.post("/", checkJWT_1.checkJWT, conversations_controller_1.createConversationController);
/**
 * POST /api/conversations/:id/end
 * Termina la conversación (ended_at) y encola mensaje para transcripción.
 */
router.post("/:id/end", checkJWT_1.checkJWT, conversations_controller_1.endConversationController);
/**
 * POST /api/conversations/:id/fragments
 * Body: { sequenceIndex: number, recordedAt: string (ISO) }
 * Devuelve { uploadUrl, s3Key, expiresAt } para subir el fragmento de audio (PUT a uploadUrl).
 */
router.post("/:id/fragments", checkJWT_1.checkJWT, conversations_controller_1.getPresignedFragmentUrlController);
/**
 * POST /api/conversations/:id/fragments/confirm
 * Body: { sequenceIndex: number, recordedAt: string (ISO), s3Key: string }
 * Encola el fragmento en neurofile-audio-fragments (el worker persiste en BD).
 */
router.post("/:id/fragments/confirm", checkJWT_1.checkJWT, conversations_controller_1.confirmFragmentController);
