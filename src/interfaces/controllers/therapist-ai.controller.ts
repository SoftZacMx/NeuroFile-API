import { Response } from "express";
import { RequestWithUser } from "../../shared/types/RequestWithUser";
import { successResponse, errorResponse, forbiddenResponse } from "../../shared/helpers/response.helper";
import { AskLastSessionUseCase } from "../../aplication/use-cases/therapist-ai/AskLastSessionUseCase";
import { AskEvolutionUseCase } from "../../aplication/use-cases/therapist-ai/AskEvolutionUseCase";
import { SuggestClinicalNoteUseCase } from "../../aplication/use-cases/therapist-ai/SuggestClinicalNoteUseCase";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";
import { ExpedientRepositoryImpl } from "../../infrastructure/repositories/ExpedientsRepositoryImplementation";
import { ConversationRepositoryImpl } from "../../infrastructure/repositories/ConversationRepositoryImpl";
import { ClinicalNoteRepositoryImpl } from "../../infrastructure/repositories/ClincalNotesRepository";
import { ExpedientDraftRepositoryImpl } from "../../infrastructure/repositories/ExpedientDraftRepositoryImpl";
import { TherapistContextService } from "../../aplication/services/TherapistContextService";
import { OpenAIChatServiceImpl } from "../../infrastructure/services/OpenAIChatServiceImpl";

const expedientRepository = new ExpedientRepositoryImpl();
const conversationRepository = new ConversationRepositoryImpl();
const clinicalNotesRepository = new ClinicalNoteRepositoryImpl();
const expedientDraftRepository = new ExpedientDraftRepositoryImpl();
const contextService = new TherapistContextService({
  conversationRepository,
  clinicalNotesRepository,
  expedientDraftRepository,
  expedientRepository,
});
const openAIChat = new OpenAIChatServiceImpl();
const askLastSessionUseCase = new AskLastSessionUseCase(expedientRepository, contextService, openAIChat);
const askEvolutionUseCase = new AskEvolutionUseCase(expedientRepository, contextService, openAIChat);
const suggestClinicalNoteUseCase = new SuggestClinicalNoteUseCase(
  conversationRepository,
  expedientRepository,
  contextService,
  openAIChat
);

export const askLastSessionController = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    if (!currentUserId) {
      res.status(401).json(forbiddenResponse("No autenticado"));
      return;
    }
    const body = req.body as { recordId?: number; patientId?: number; question?: string };
    const result = await askLastSessionUseCase.execute(
      {
        recordId: body.recordId,
        patientId: body.patientId,
        question: body.question,
      },
      currentUserId
    );
    res.status(200).json(successResponse(result, "OK"));
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error("[therapist-ai] askLastSession:", err);
    res.status(500).json(errorResponse("Error al generar la respuesta", 500, undefined, "INTERNAL_ERROR"));
  }
};

export const askEvolutionController = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    if (!currentUserId) {
      res.status(401).json(forbiddenResponse("No autenticado"));
      return;
    }
    const body = req.body as { recordId?: number; patientId?: number; months?: number };
    const result = await askEvolutionUseCase.execute(
      { recordId: body.recordId, patientId: body.patientId, months: body.months },
      currentUserId
    );
    res.status(200).json(successResponse(result, "OK"));
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error("[therapist-ai] askEvolution:", err);
    res.status(500).json(errorResponse("Error al generar la respuesta", 500, undefined, "INTERNAL_ERROR"));
  }
};

export const suggestClinicalNoteController = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    if (!currentUserId) {
      res.status(401).json(forbiddenResponse("No autenticado"));
      return;
    }
    const body = req.body as { conversationId: number; section?: "evolution" | "closing" | "full" };
    if (body.conversationId == null) {
      res.status(400).json(errorResponse("conversationId es requerido", 400, undefined, "VALIDATION_ERROR"));
      return;
    }
    const result = await suggestClinicalNoteUseCase.execute(
      { conversationId: body.conversationId, section: body.section },
      currentUserId
    );
    res.status(200).json(successResponse(result, "OK"));
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error("[therapist-ai] suggestClinicalNote:", err);
    res.status(500).json(errorResponse("Error al generar la sugerencia", 500, undefined, "INTERNAL_ERROR"));
  }
};
