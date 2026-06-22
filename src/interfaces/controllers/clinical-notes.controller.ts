import { ClinicalNoteRepositoryImpl } from "../../infrastructure/repositories/ClincalNotesRepository";
import { CreateClinicalNoteUseCase } from "../../aplication/use-cases/clinical_notes/CreateClinicalNoteUseCase";
import {
  errorResponse,
  successResponse,
  forbiddenResponse,
} from "../../shared/helpers/response.helper";
import { Messages, Codes } from "../../shared/constants/messages";
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
      const prismaErr = newClinicalNote as IPrismaError;
      const statusCode = prismaErr.code === "P2000" ? 400 : 500;
      const error = errorResponse(
        prismaErr.message || Messages.clinicalNote.createError,
        statusCode,
        newClinicalNote,
        Codes.CREATE_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(newClinicalNote, Messages.clinicalNote.createSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(Messages.clinicalNote.createFail, 500, undefined, Codes.CREATE_ERROR);
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
        Messages.clinicalNote.updateError,
        500,
        updatedClinicalNote,
        Codes.UPDATE_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(updatedClinicalNote, Messages.clinicalNote.updateSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.clinicalNote.updateFail, 500, undefined, Codes.UPDATE_ERROR);
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
        Messages.clinicalNote.deleteError,
        500,
        removeClinicalNote,
        Codes.DELETE_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(removeClinicalNote, Messages.clinicalNote.deleteSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.clinicalNote.deleteFail, 500, undefined, Codes.DELETE_ERROR);
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
      const error = errorResponse(Messages.clinicalNote.recordIdRequired, 400, undefined, Codes.VALIDATION_ERROR);
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
        Messages.clinicalNote.listError,
        500,
        clinicalNotes,
        Codes.LIST_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(clinicalNotes, Messages.clinicalNote.listSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(Messages.clinicalNote.listFail, 500, undefined, Codes.LIST_ERROR);
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
        Messages.clinicalNote.getError,
        500,
        clinicalNote,
        Codes.GET_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(clinicalNote, Messages.clinicalNote.getSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.clinicalNote.getFail, 500, undefined, Codes.GET_ERROR);
    res.status(error.status_code).json(error);
  }
};
