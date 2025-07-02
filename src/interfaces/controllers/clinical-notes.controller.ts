import { ClinicalNoteRepositoryImpl } from "../../infrastructure/repositories/ClincalNotesRepository";
import { CreateClinicalNoteUseCase } from "../../aplication/use-cases/clinical_notes/CreateClinicalNoteUseCase";
import {
  errorResponse,
  successResponse,
} from "../../shared/helpers/response.helper";
import { Request, Response } from "express";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";
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
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { note_id } = req.params;
    const updatedClinicalNote = await updateNoteUseCase.execute(
      req.body,
      parseInt(note_id)
    );

    if ((updatedClinicalNote as IPrismaError).code) {
      const error = errorResponse(
        "No pudo ser actualizda la nota",
        500,
        updatedClinicalNote
      );
      res.status(error.status_code).json(error);
    }

    const success = successResponse(
      updatedClinicalNote,
      "Nota clinica actualizada con éxito"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(
      "Error al intentar actualizar la nota clinica",
      500
    );
    res.status(error.status_code).json(error);
  }
};

export const deleteClinicalNoteController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { note_id } = req.params;
    const removeClinicalNote = await deleteNoteUseCase.execute(
      parseInt(note_id)
    );

    if ((removeClinicalNote as IPrismaError).code) {
      const error = errorResponse(
        "No pudo ser eliminada la nota",
        500,
        removeClinicalNote
      );
      res.status(error.status_code).json(error);
    }

    const success = successResponse(
      removeClinicalNote,
      "Nota clinica eliminada con éxito"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
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
    const { record_id } = req.body;
    const clinicalNotes = await getNotesUseCase.execute(parseInt(record_id));

    if ((clinicalNotes as IPrismaError).code) {
      const error = errorResponse(
        "No se pudieron obtener las notas clinicas",
        500,
        clinicalNotes
      );
      res.status(error.status_code).json(error);
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
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { note_id } = req.params;
    console.log("note_id", note_id);

    const clinicalNote = await getNoteUseCase.execute(parseInt(note_id));

    if ((clinicalNote as IPrismaError).code) {
      const error = errorResponse(
        "No se pudo obtener las nota clinicas",
        500,
        clinicalNote
      );
      res.status(error.status_code).json(error);
    }

    const success = successResponse(
      clinicalNote,
      "Nota clinica encontrada con éxito"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(
      "Error al intentar obtener la nota clinica",
      500
    );
    res.status(error.status_code).json(error);
  }
};
