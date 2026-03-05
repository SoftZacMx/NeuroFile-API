import { Response } from "express";
import { RequestWithUser } from "../../shared/types/RequestWithUser";
import { successResponse, errorResponse } from "../../shared/helpers/response.helper";
import { CreateConversationUseCase } from "../../aplication/use-cases/conversations/CreateConversationUseCase";
import { EndConversationUseCase } from "../../aplication/use-cases/conversations/EndConversationUseCase";
import { GetPresignedFragmentUrlUseCase } from "../../aplication/use-cases/conversations/GetPresignedFragmentUrlUseCase";
import { ConfirmFragmentUseCase } from "../../aplication/use-cases/conversations/ConfirmFragmentUseCase";
import { ConversationRepositoryImpl } from "../../infrastructure/repositories/ConversationRepositoryImpl";
import { ExpedientRepositoryImpl } from "../../infrastructure/repositories/ExpedientsRepositoryImplementation";
import { S3ServiceImpl } from "../../infrastructure/services/S3ServiceImpl";
import { SqsServiceImpl } from "../../infrastructure/services/SqsServiceImpl";

const conversationRepository = new ConversationRepositoryImpl();
const expedientRepository = new ExpedientRepositoryImpl();
const sqsService = new SqsServiceImpl();
const s3Service = new S3ServiceImpl();
const createConversationUseCase = new CreateConversationUseCase(
  conversationRepository,
  expedientRepository
);
const endConversationUseCase = new EndConversationUseCase(
  conversationRepository,
  sqsService
);
const getPresignedFragmentUrlUseCase = new GetPresignedFragmentUrlUseCase(
  conversationRepository,
  s3Service
);
const confirmFragmentUseCase = new ConfirmFragmentUseCase(
  conversationRepository,
  sqsService
);

/**
 * POST /api/conversations
 * Body: { recordId: number }
 * Crea una conversación para el expediente. El usuario debe ser el dueño del expediente (paciente del usuario).
 */
export const createConversationController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const recordId =
      typeof req.body?.recordId === "number"
        ? req.body.recordId
        : parseInt(req.body?.recordId, 10);

    if (isNaN(recordId) || recordId <= 0) {
      const error = errorResponse("recordId inválido o faltante", 400);
      res.status(error.status_code).json(error);
      return;
    }

    const userId = parseInt(req.user?.sub ?? "", 10);
    if (isNaN(userId)) {
      const error = errorResponse("Usuario no identificado", 401);
      res.status(error.status_code).json(error);
      return;
    }

    const result = await createConversationUseCase.execute(recordId, userId);

    if ("error" in result) {
      const message =
        result.error === "RECORD_NOT_FOUND"
          ? "Expediente no encontrado"
          : "No tiene permiso para crear conversación en este expediente";
      const error = errorResponse(message, result.statusCode);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      { conversationId: result.conversationId, startedAt: result.startedAt },
      "Conversación creada"
    );
    res.status(201).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al crear la conversación", 500);
    res.status(error.status_code).json(error);
  }
};

/**
 * POST /api/conversations/:id/end
 * Marca la conversación como terminada y encola mensaje para transcripción.
 */
export const endConversationController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const conversationId = parseInt(req.params.id, 10);
    if (isNaN(conversationId) || conversationId <= 0) {
      const error = errorResponse("id de conversación inválido", 400);
      res.status(error.status_code).json(error);
      return;
    }

    const userId = parseInt(req.user?.sub ?? "", 10);
    if (isNaN(userId)) {
      const error = errorResponse("Usuario no identificado", 401);
      res.status(error.status_code).json(error);
      return;
    }

    const result = await endConversationUseCase.execute(conversationId, userId);

    if ("error" in result) {
      const message =
        result.error === "NOT_FOUND"
          ? "Conversación no encontrada"
          : "No tiene permiso para terminar esta conversación";
      const error = errorResponse(message, result.statusCode);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(null, "Conversación terminada");
    res.status(200).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al terminar la conversación", 500);
    res.status(error.status_code).json(error);
  }
};

/**
 * POST /api/conversations/:id/fragments
 * Body: { sequenceIndex: number, recordedAt: string (ISO) }
 * Devuelve presigned URL (PUT) para subir el fragmento de audio a S3.
 */
export const getPresignedFragmentUrlController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const conversationId = parseInt(req.params.id, 10);
    if (isNaN(conversationId) || conversationId <= 0) {
      const error = errorResponse("id de conversación inválido", 400);
      res.status(error.status_code).json(error);
      return;
    }

    const sequenceIndex =
      typeof req.body?.sequenceIndex === "number"
        ? req.body.sequenceIndex
        : parseInt(req.body?.sequenceIndex, 10);
    if (isNaN(sequenceIndex) || sequenceIndex < 0) {
      const error = errorResponse("sequenceIndex inválido o faltante", 400);
      res.status(error.status_code).json(error);
      return;
    }

    if (req.body?.recordedAt == null || typeof req.body.recordedAt !== "string") {
      const error = errorResponse("recordedAt inválido o faltante", 400);
      res.status(error.status_code).json(error);
      return;
    }

    const userId = parseInt(req.user?.sub ?? "", 10);
    if (isNaN(userId)) {
      const error = errorResponse("Usuario no identificado", 401);
      res.status(error.status_code).json(error);
      return;
    }

    const result = await getPresignedFragmentUrlUseCase.execute(
      conversationId,
      userId,
      sequenceIndex
    );

    if ("error" in result) {
      const message =
        result.error === "NOT_FOUND"
          ? "Conversación no encontrada"
          : result.error === "FORBIDDEN"
            ? "No tiene permiso para esta conversación"
            : "La conversación ya está terminada";
      const error = errorResponse(message, result.statusCode);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      {
        uploadUrl: result.uploadUrl,
        s3Key: result.s3Key,
        expiresAt: result.expiresAt,
      },
      "URL de subida generada"
    );
    res.status(200).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al generar URL de subida", 500);
    res.status(error.status_code).json(error);
  }
};

/**
 * POST /api/conversations/:id/fragments/confirm
 * Body: { sequenceIndex: number, recordedAt: string (ISO), s3Key: string }
 * Encola el fragmento en neurofile-audio-fragments para que el worker lo persista.
 */
export const confirmFragmentController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const conversationId = parseInt(req.params.id, 10);
    if (isNaN(conversationId) || conversationId <= 0) {
      const error = errorResponse("id de conversación inválido", 400);
      res.status(error.status_code).json(error);
      return;
    }

    const sequenceIndex =
      typeof req.body?.sequenceIndex === "number"
        ? req.body.sequenceIndex
        : parseInt(req.body?.sequenceIndex, 10);
    if (isNaN(sequenceIndex) || sequenceIndex < 0) {
      const error = errorResponse("sequenceIndex inválido o faltante", 400);
      res.status(error.status_code).json(error);
      return;
    }

    const recordedAt = req.body?.recordedAt;
    if (typeof recordedAt !== "string" || !recordedAt.trim()) {
      const error = errorResponse("recordedAt inválido o faltante", 400);
      res.status(error.status_code).json(error);
      return;
    }

    const s3Key = req.body?.s3Key;
    if (typeof s3Key !== "string" || !s3Key.trim()) {
      const error = errorResponse("s3Key inválido o faltante", 400);
      res.status(error.status_code).json(error);
      return;
    }

    const userId = parseInt(req.user?.sub ?? "", 10);
    if (isNaN(userId)) {
      const error = errorResponse("Usuario no identificado", 401);
      res.status(error.status_code).json(error);
      return;
    }

    const result = await confirmFragmentUseCase.execute(conversationId, userId, {
      sequenceIndex,
      recordedAt: recordedAt.trim(),
      s3Key: s3Key.trim(),
    });

    if ("error" in result) {
      const message =
        result.error === "NOT_FOUND"
          ? "Conversación no encontrada"
          : "No tiene permiso para esta conversación";
      const error = errorResponse(message, result.statusCode);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      null,
      "Fragmento encolado para procesamiento"
    );
    res.status(202).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al confirmar el fragmento", 500);
    res.status(error.status_code).json(error);
  }
};
