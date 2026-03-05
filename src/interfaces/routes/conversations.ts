import { Router } from "express";
import { checkJWT } from "../middelwares/auth/checkJWT";
import {
  createConversationController,
  endConversationController,
  getPresignedFragmentUrlController,
  confirmFragmentController,
} from "../controllers/conversations.controller";

const router = Router();

/**
 * POST /api/conversations
 * Body: { recordId: number }
 * Crea una conversación para grabar audio por fragmentos. Requiere JWT. El expediente debe pertenecer al usuario.
 */
router.post("/", checkJWT, createConversationController);

/**
 * POST /api/conversations/:id/end
 * Termina la conversación (ended_at) y encola mensaje para transcripción.
 */
router.post("/:id/end", checkJWT, endConversationController);

/**
 * POST /api/conversations/:id/fragments
 * Body: { sequenceIndex: number, recordedAt: string (ISO) }
 * Devuelve { uploadUrl, s3Key, expiresAt } para subir el fragmento de audio (PUT a uploadUrl).
 */
router.post("/:id/fragments", checkJWT, getPresignedFragmentUrlController);

/**
 * POST /api/conversations/:id/fragments/confirm
 * Body: { sequenceIndex: number, recordedAt: string (ISO), s3Key: string }
 * Encola el fragmento en neurofile-audio-fragments (el worker persiste en BD).
 */
router.post("/:id/fragments/confirm", checkJWT, confirmFragmentController);

export { router };
