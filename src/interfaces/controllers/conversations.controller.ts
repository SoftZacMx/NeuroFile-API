import { Response } from "express";
import { RequestWithUser } from "../../shared/types/RequestWithUser";
import { successResponse, errorResponse } from "../../shared/helpers/response.helper";
import { CreateConversationUseCase } from "../../aplication/use-cases/conversations/CreateConversationUseCase";
import { EndConversationUseCase } from "../../aplication/use-cases/conversations/EndConversationUseCase";
import { GetPresignedFragmentUrlUseCase } from "../../aplication/use-cases/conversations/GetPresignedFragmentUrlUseCase";
import { ConfirmFragmentUseCase } from "../../aplication/use-cases/conversations/ConfirmFragmentUseCase";
import { UploadFragmentUseCase } from "../../aplication/use-cases/conversations/UploadFragmentUseCase";
import { ConversationRepositoryImpl } from "../../infrastructure/repositories/ConversationRepositoryImpl";
import { ExpedientRepositoryImpl } from "../../infrastructure/repositories/ExpedientsRepositoryImplementation";
import { PatientRepositoryImplementation } from "../../infrastructure/repositories/PatientsRepositoryImplementation";
import { S3ServiceImpl } from "../../infrastructure/services/S3ServiceImpl";
import { SqsServiceImpl } from "../../infrastructure/services/SqsServiceImpl";

const conversationRepository = new ConversationRepositoryImpl();
const expedientRepository = new ExpedientRepositoryImpl();
const patientRepository = new PatientRepositoryImplementation();
const sqsService = new SqsServiceImpl();
const s3Service = new S3ServiceImpl();
const createConversationUseCase = new CreateConversationUseCase(
  conversationRepository,
  expedientRepository,
  patientRepository
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
const uploadFragmentUseCase = new UploadFragmentUseCase(
  conversationRepository,
  s3Service,
  sqsService
);

/**
 * POST /api/conversations
 * Body: { recordId?: number, patientId?: number } — exactamente uno requerido.
 * - recordId: crea conversación para el expediente existente (usuario debe ser dueño del expediente).
 * - patientId: crea expediente vacío para el paciente y luego la conversación (usuario debe ser dueño del paciente). Devuelve también recordId.
 */
export const createConversationController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const recordId =
      req.body?.recordId != null
        ? typeof req.body.recordId === "number"
          ? req.body.recordId
          : parseInt(req.body.recordId, 10)
        : null;
    const patientId =
      req.body?.patientId != null
        ? typeof req.body.patientId === "number"
          ? req.body.patientId
          : parseInt(req.body.patientId, 10)
        : null;

    const hasRecord = recordId != null && !isNaN(recordId) && recordId > 0;
    const hasPatient = patientId != null && !isNaN(patientId) && patientId > 0;

    if (hasRecord && hasPatient) {
      const error = errorResponse("Envíe solo recordId o solo patientId", 400);
      res.status(error.status_code).json(error);
      return;
    }
    if (!hasRecord && !hasPatient) {
      const error = errorResponse("Envíe recordId o patientId", 400);
      res.status(error.status_code).json(error);
      return;
    }

    const userId = parseInt(req.user?.sub ?? "", 10);
    if (isNaN(userId)) {
      const error = errorResponse("Usuario no identificado", 401);
      res.status(error.status_code).json(error);
      return;
    }

    const result = await createConversationUseCase.execute(
      hasRecord ? { recordId: recordId! } : { patientId: patientId! },
      userId
    );

    if ("error" in result) {
      const message =
        result.error === "RECORD_NOT_FOUND"
          ? "Expediente no encontrado"
          : result.error === "PATIENT_NOT_FOUND"
            ? "Paciente no encontrado"
            : "No tiene permiso para crear conversación";
      const error = errorResponse(message, result.statusCode);
      res.status(error.status_code).json(error);
      return;
    }

    const payload: { conversationId: number; startedAt: Date; recordId?: number } =
      {
        conversationId: result.conversationId,
        startedAt: result.startedAt,
      };
    if (result.recordId != null) payload.recordId = result.recordId;

    const success = successResponse(payload, "Conversación creada");
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
    console.log("[api] POST /conversations/:id/end recibido. conversationId=%s", conversationId);

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

    console.log(
      "[api] Conversación terminada; mensaje encolado en neurofile-transcribe-conversation. conversationId=%s",
      conversationId
    );
    const success = successResponse(null, "Conversación terminada");
    res.status(200).json(success);
  } catch (err) {
    console.error("[api] Error al terminar la conversación:", err);
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

/**
 * POST /api/conversations/:id/fragments/upload
 * Multipart: sequenceIndex, recordedAt (form fields), file (archivo de audio).
 * La API sube el archivo a S3 y encola el mensaje; el worker persiste en BD.
 * Flujo recomendado: el front solo inicia conversación, envía fragmentos por este endpoint y termina conversación.
 */
export const uploadFragmentController = async (
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

    const file = (req as RequestWithUser & { file?: Express.Multer.File }).file;
    if (!file?.buffer) {
      const error = errorResponse("Archivo de audio requerido (campo 'file')", 400);
      res.status(error.status_code).json(error);
      return;
    }

    const sequenceIndex =
      typeof req.body?.sequenceIndex === "number"
        ? req.body.sequenceIndex
        : parseInt(String(req.body?.sequenceIndex ?? ""), 10);
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

    const userId = parseInt(req.user?.sub ?? "", 10);
    if (isNaN(userId)) {
      const error = errorResponse("Usuario no identificado", 401);
      res.status(error.status_code).json(error);
      return;
    }

    const result = await uploadFragmentUseCase.execute(conversationId, userId, {
      sequenceIndex,
      recordedAt: recordedAt.trim(),
      fileBuffer: file.buffer,
    });

    if ("error" in result) {
      const message =
        result.error === "NOT_FOUND"
          ? "Conversación no encontrada"
          : result.error === "FORBIDDEN"
            ? "No tiene permiso para esta conversación"
            : result.error === "CONVERSATION_ENDED"
              ? "La conversación ya está terminada"
              : "Archivo de audio requerido";
      const error = errorResponse(message, result.statusCode);
      res.status(error.status_code).json(error);
      return;
    }

    console.log(
      "[api] Fragmento subido; mensaje encolado en neurofile-audio-fragments. conversationId=%s sequenceIndex=%s s3Key=%s",
      conversationId,
      sequenceIndex,
      result.s3Key
    );
    const success = successResponse(
      { s3Key: result.s3Key },
      "Fragmento subido y encolado"
    );
    res.status(201).json(success);
  } catch (err) {
    console.error("[api] Error al subir el fragmento:", err);
    const error = errorResponse("Error al subir el fragmento", 500);
    res.status(error.status_code).json(error);
  }
};
