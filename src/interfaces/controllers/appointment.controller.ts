import { Request, Response } from "express";
import { RequestWithUser } from "../../shared/types/RequestWithUser";
import { CreateAppointmentUseCase } from "../../aplication/use-cases/appointments/CreateAppointmentUseCase";
import { UpdateAppointmentUseCase } from "../../aplication/use-cases/appointments/UpdateApoitmentUseCase";
import { DeleteAppointmentUseCase } from "../../aplication/use-cases/appointments/DeleteAppointmentUseCase";
import { GetAppointmentUseCase } from "../../aplication/use-cases/appointments/GetAppointmentUseCase";
import { GetAppointmentsUseCase } from "../../aplication/use-cases/appointments/GetAppointmentsUseCase";
import { AppointmentRepositoryImpl } from "../../infrastructure/repositories/AppointmentsRepositoryImple";
import { successResponse, errorResponse } from "../../shared/helpers/response.helper";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";

const repo = new AppointmentRepositoryImpl();
const createUC = new CreateAppointmentUseCase(repo);
const updateUC = new UpdateAppointmentUseCase(repo);
const deleteUC = new DeleteAppointmentUseCase(repo);
const getOneUC = new GetAppointmentUseCase(repo);
const getAllUC = new GetAppointmentsUseCase(repo);


export const createAppointmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newAppointment = await createUC.execute(req.body);

    if ((newAppointment as IPrismaError).code) {
      const error = errorResponse(
        "No pudo ser actualizda la nota",
        500,
        newAppointment
      );
      res.status(error.status_code).json(error);
    }

    const success = successResponse(
      newAppointment,
      "Appointmente creado con éxito"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al intentar crear la cita", 500);
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
        "No pudo ser actualizda la cita",
        500,
        AppointmentUpdated
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      AppointmentUpdated,
      "Appointment updated successfuly"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ result: false, message: err.message });
      return;
    }
    console.error(err);
    const error = errorResponse("Error al actualizar la cita", 500);
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
        "No pudo ser eliminat la cita",
        500,
        AppointmentDeleted
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      AppointmentDeleted,
      "Appointment deleted successfuly"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ result: false, message: err.message });
      return;
    }
    console.error(err);
    const error = errorResponse("Error al eliminar la cita", 500);
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
        "No se pudieron obtener las citas",
        500,
        AppointmentsGeted
      );
      res.status(error.status_code).json(error);
    }

    const success = successResponse(
      AppointmentsGeted,
      "Appointments geted successfuly"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al obtener las citas", 500);
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
        isNotFound ? "Cita no encontrada." : "No se pudo obtener la cita",
        statusCode,
        AppointmentGeted
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      AppointmentGeted,
      "Appointment geted successfuly"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ result: false, message: err.message });
      return;
    }
    console.error(err);
    const error = errorResponse("Error al obtener la cita", 500);
    res.status(error.status_code).json(error);
  }
};
