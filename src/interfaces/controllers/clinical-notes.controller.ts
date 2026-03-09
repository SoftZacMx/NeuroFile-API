import { ClinicalNoteRepositoryImpl } from "../../infrastructure/repositories/ClincalNotesRepository";
import { CreateClinicalNoteUseCase } from "../../aplication/use-cases/clinical_notes/CreateClinicalNoteUseCase";
import {
  errorResponse,
  successResponse,
} from "../../shared/helpers/response.helper";
import { Request, Response } from "express";
import { RequestWithUser } from "../../shared/types/RequestWithUser";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";
import { UpdateClinicalNoteUseCase } from "../../aplication/use-cases/clinical_notes/UpdateClinicalNoteUseCase";
import { RemoveClinicalNoteUseCase } from "../../aplication/use-cases/clinical_notes/DeleteClinicalNoteUseCase";
import { GetClinicalNotesUseCase } from "../../aplication/use-cases/clinical_notes/GetClinicalNotesUseCase";
import { GetClinicalNoteUseCase } from "../../aplication/use-cases/clinical_notes/GetClinicalNoteUseCase";

const clinicalNoteRepository = new ClinicalNoteRepositoryImpl();
const createNoteUseCase = new CreateClinicalNoteUseCase(clinicalNoteRepository);
const updateNoteUseCase = new UpdateClinicalNoteUseCase(clinicalNoteRepository);
const deleteNoteUseCase = new RemoveClinicalNoteUseCase(clinicalNoteRepository);
const getNotesUseCase = new GetClinicalNotesUseCase(clinicalNoteRepository);
const getNoteUseCase = new GetClinicalNoteUseCase(clinicalNoteRepository);

export const createClinicalNoteController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newClinicalNote = await createNoteUseCase.execute(req.body);

    if ((newClinicalNote as IPrismaError).code) {
      const error = errorResponse(
        "No pudo ser creada la nota",
        500,
        newClinicalNote
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      newClinicalNote,
      "Nota clinica creado con éxito"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al intentar crear la nota clinica", 500);
    res.status(error.status_code).json(error);
  }
};

export const updateClinicalNoteController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { note_id } = req.params;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const updatedClinicalNote = await updateNoteUseCase.execute(
      req.body,
      parseInt(note_id),
      currentUserId
    );

    if ((updatedClinicalNote as IPrismaError).code) {
      const error = errorResponse(
        "No pudo ser actualizda la nota",
        500,
        updatedClinicalNote
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      updatedClinicalNote,
      "Nota clinica actualizada con éxito"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ result: false, message: err.message });
      return;
    }
    console.error(err);
    const error = errorResponse(
      "Error al intentar actualizar la nota clinica",
      500
    );
    res.status(error.status_code).json(error);
  }
};

export const deleteClinicalNoteController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { note_id } = req.params;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const removeClinicalNote = await deleteNoteUseCase.execute(
      parseInt(note_id),
      currentUserId
    );

    if ((removeClinicalNote as IPrismaError).code) {
      const error = errorResponse(
        "No pudo ser eliminada la nota",
        500,
        removeClinicalNote
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      removeClinicalNote,
      "Nota clinica eliminada con éxito"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ result: false, message: err.message });
      return;
    }
    console.error(err);
    const error = errorResponse(
      "Error al intentar eliminar la nota clinica",
      500
    );
    res.status(error.status_code).json(error);
  }
};

export const getClinicalNotesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const recordIdParam = req.query.record_id ?? req.body?.record_id;
    const recordId = recordIdParam != null ? parseInt(String(recordIdParam), 10) : NaN;
    if (Number.isNaN(recordId)) {
      const error = errorResponse("record_id es requerido", 400);
      res.status(error.status_code).json(error);
      return;
    }
    const dateFrom =
      typeof req.query.dateFrom === "string" && req.query.dateFrom
        ? req.query.dateFrom
        : undefined;
    const dateTo =
      typeof req.query.dateTo === "string" && req.query.dateTo
        ? req.query.dateTo
        : undefined;
    const clinicalNotes = await getNotesUseCase.execute(
      recordId,
      dateFrom,
      dateTo
    );

    if ((clinicalNotes as IPrismaError).code) {
      const error = errorResponse(
        "No se pudieron obtener las notas clinicas",
        500,
        clinicalNotes
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      clinicalNotes,
      "Notas clinica encontradas con éxito"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(
      "Error al intentar obtener las notas clinica",
      500
    );
    res.status(error.status_code).json(error);
  }
};

export const getClinicalNoteController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { note_id } = req.params;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const clinicalNote = await getNoteUseCase.execute(parseInt(note_id), currentUserId);

    if ((clinicalNote as IPrismaError).code) {
      const error = errorResponse(
        "No se pudo obtener las nota clinicas",
        500,
        clinicalNote
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      clinicalNote,
      "Nota clinica encontrada con éxito"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ result: false, message: err.message });
      return;
    }
    console.error(err);
    const error = errorResponse(
      "Error al intentar obtener la nota clinica",
      500
    );
    res.status(error.status_code).json(error);
  }
};
