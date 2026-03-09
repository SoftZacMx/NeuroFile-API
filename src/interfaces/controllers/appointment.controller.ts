import { Request, Response } from "express";
import { RequestWithUser } from "../../shared/types/RequestWithUser";
import { CreateAppointmentUseCase } from "../../aplication/use-cases/appointments/CreateAppointmentUseCase";
import { UpdateAppointmentUseCase } from "../../aplication/use-cases/appointments/UpdateApoitmentUseCase";
import { DeleteAppointmentUseCase } from "../../aplication/use-cases/appointments/DeleteAppointmentUseCase";
import { GetAppointmentUseCase } from "../../aplication/use-cases/appointments/GetAppointmentUseCase";
import { GetAppointmentsUseCase } from "../../aplication/use-cases/appointments/GetAppointmentsUseCase";
import { AppointmentRepositoryImpl } from "../../infrastructure/repositories/AppointmentsRepositoryImple";
import { PatientRepositoryImplementation } from "../../infrastructure/repositories/PatientsRepositoryImplementation";
import { successResponse, errorResponse, forbiddenResponse } from "../../shared/helpers/response.helper";
import { Messages, Codes } from "../../shared/constants/messages";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";

const repo = new AppointmentRepositoryImpl();
const patientRepo = new PatientRepositoryImplementation();
const createUC = new CreateAppointmentUseCase(repo, patientRepo);
const updateUC = new UpdateAppointmentUseCase(repo);
const deleteUC = new DeleteAppointmentUseCase(repo);
const getOneUC = new GetAppointmentUseCase(repo);
const getAllUC = new GetAppointmentsUseCase(repo);


export const createAppointmentController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const newAppointment = await createUC.execute(req.body, currentUserId);

    if ((newAppointment as IPrismaError).code) {
      const error = errorResponse(
        Messages.appointment.createError,
        500,
        newAppointment,
        Codes.CREATE_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(newAppointment, Messages.appointment.createSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.appointment.createFail, 500, undefined, Codes.CREATE_ERROR);
    res.status(error.status_code).json(error);
  }
};

export const updateAppointmentController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { appointment_id } = req.params;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const AppointmentUpdated = await updateUC.execute(
      parseInt(appointment_id),
      req.body,
      currentUserId
    );

    if ((AppointmentUpdated as IPrismaError).code) {
      const error = errorResponse(
        Messages.appointment.updateError,
        500,
        AppointmentUpdated,
        Codes.UPDATE_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(AppointmentUpdated, Messages.appointment.updateSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.appointment.updateFail, 500, undefined, Codes.UPDATE_ERROR);
    res.status(error.status_code).json(error);
  }
};

export const deleteAppointmentController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { appointment_id } = req.params;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const AppointmentDeleted = await deleteUC.execute(parseInt(appointment_id), currentUserId);

    if ((AppointmentDeleted as IPrismaError).code) {
      const error = errorResponse(
        Messages.appointment.deleteError,
        500,
        AppointmentDeleted,
        Codes.DELETE_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(AppointmentDeleted, Messages.appointment.deleteSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.appointment.deleteFail, 500, undefined, Codes.DELETE_ERROR);
    res.status(error.status_code).json(error);
  }
};

export const getAppointmentsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const patientIdParam = req.query.patientId;
    const patientId =
      patientIdParam != null
        ? parseInt(String(patientIdParam), 10)
        : undefined;
    const patientIdFilter =
      patientId != null && !Number.isNaN(patientId) ? patientId : undefined;
    const dateFrom =
      typeof req.query.dateFrom === "string" && req.query.dateFrom
        ? req.query.dateFrom
        : undefined;
    const dateTo =
      typeof req.query.dateTo === "string" && req.query.dateTo
        ? req.query.dateTo
        : undefined;
    const AppointmentsGeted = await getAllUC.execute(
      patientIdFilter,
      dateFrom,
      dateTo
    );

    if ((AppointmentsGeted as IPrismaError).code) {
      const error = errorResponse(
        Messages.appointment.listError,
        500,
        AppointmentsGeted,
        Codes.LIST_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(AppointmentsGeted, Messages.appointment.listSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(Messages.appointment.listFail, 500, undefined, Codes.LIST_ERROR);
    res.status(error.status_code).json(error);
  }
};

export const getAppointmentController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { appointment_id } = req.params;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const AppointmentGeted = await getOneUC.execute(
      parseInt(appointment_id),
      currentUserId
    );

    const err = AppointmentGeted as IPrismaError;
    if (err.code) {
      const isNotFound = err.code === "P2025" || (err.message && String(err.message).toLowerCase().includes("not found"));
      const statusCode = isNotFound ? 404 : 500;
      const error = errorResponse(
        isNotFound ? Messages.appointment.notFound : Messages.appointment.getError,
        statusCode,
        AppointmentGeted,
        isNotFound ? Codes.NOT_FOUND : Codes.GET_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(AppointmentGeted, Messages.appointment.getSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.appointment.getFail, 500, undefined, Codes.GET_ERROR);
    res.status(error.status_code).json(error);
  }
};
