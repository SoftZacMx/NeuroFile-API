import { Router } from "express";
import multer from "multer";
import { checkJWT } from "../middelwares/auth/checkJWT";
import {
  createConversationController,
  endConversationController,
  getPresignedFragmentUrlController,
  confirmFragmentController,
  uploadFragmentController,
} from "../controllers/conversations.controller";

const router = Router();

const uploadFragmentMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB por fragmento
}).single("file");

/**
 * POST /api/conversations
 * Body: { recordId?: number, patientId?: number } — exactamente uno requerido.
 * recordId: conversación para expediente existente. patientId: crea expediente vacío para el paciente y la conversación (devuelve también recordId). Requiere JWT.
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
 * POST /api/conversations/:id/fragments/upload (recomendado)
 * Multipart: sequenceIndex, recordedAt (form), file (archivo de audio). Máx 25 MB.
 * La API sube a S3 y encola; el worker persiste en BD. El front solo envía el archivo.
 */
router.post("/:id/fragments/upload", checkJWT, uploadFragmentMulter, uploadFragmentController);

/**
 * POST /api/conversations/:id/fragments/confirm
 * Body: { sequenceIndex: number, recordedAt: string (ISO), s3Key: string }
 * Encola el fragmento en neurofile-audio-fragments (el worker persiste en BD).
 * Usado cuando el cliente sube directo a S3 (presigned) y luego confirma.
 */
router.post("/:id/fragments/confirm", checkJWT, confirmFragmentController);

export { router };
