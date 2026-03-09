import { Router } from "express";
import { checkJWT } from "../middelwares/auth/checkJWT";
import { asyncHandler } from "../../shared/middelwares/asyncHandler";
import {
  askLastSessionController,
  askEvolutionController,
  suggestClinicalNoteController,
} from "../controllers/therapist-ai.controller";

const router = Router();

/**
 * POST /api/therapist-ai/last-session
 * Body: { recordId?: number, patientId?: number, question?: string }
 * Requiere JWT. Responde con { data: { answer: string } }.
 */
router.post("/last-session", checkJWT, asyncHandler(askLastSessionController));

/**
 * POST /api/therapist-ai/evolution
 * Body: { recordId?: number, patientId?: number, months?: number }
 * Requiere JWT. Responde con { data: { answer: string } }.
 */
router.post("/evolution", checkJWT, asyncHandler(askEvolutionController));

/**
 * POST /api/therapist-ai/suggest-note
 * Body: { conversationId: number, section?: "evolution" | "closing" | "full" }
 * Requiere JWT. Responde con { data: { suggestion: string } }.
 */
router.post("/suggest-note", checkJWT, asyncHandler(suggestClinicalNoteController));

export { router };
