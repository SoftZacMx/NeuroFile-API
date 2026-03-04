import { Request, Response } from "express";
import { CreateAppointmentUseCase } from "../../aplication/use-cases/appointments/CreateAppointmentUseCase";
import { UpdateAppointmentUseCase } from "../../aplication/use-cases/appointments/UpdateApoitmentUseCase";
import { DeleteAppointmentUseCase } from "../../aplication/use-cases/appointments/DeleteAppointmentUseCase";
import { GetAppointmentUseCase } from "../../aplication/use-cases/appointments/GetAppointmentUseCase";
import { GetAppointmentsUseCase } from "../../aplication/use-cases/appointments/GetAppointmentsUseCase";
import { AppointmentRepositoryImpl } from "../../infrastructure/repositories/AppointmentsRepositoryImple";
import { successResponse, errorResponse } from "../../shared/helpers/response.helper";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";

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
    const error = errorResponse("Error al intentar crear el Appointmente", 500);
    res.status(error.status_code).json(error);
  }
};

export const updateAppointmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { appointment_id } = req.params;
    console.log("Appointment ID:", appointment_id);

    const AppointmentUpdated = await updateUC.execute(
      parseInt(appointment_id),
      req.body,
    );

    if ((AppointmentUpdated as IPrismaError).code) {
      const error = errorResponse(
        "No pudo ser actualizda la cita",
        500,
        AppointmentUpdated
      );
      res.status(error.status_code).json(error);
    }

    const success = successResponse(
      AppointmentUpdated,
      "Appointment updated successfuly"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error trying to update the Appointment", 500);
    res.status(error.status_code).json(error);
  }
};

export const deleteAppointmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { appointment_id } = req.params;
    const AppointmentDeleted = await deleteUC.execute(parseInt(appointment_id));

    if ((AppointmentDeleted as IPrismaError).code) {
      const error = errorResponse(
        "No pudo ser eliminat la cita",
        500,
        AppointmentDeleted
      );
      res.status(error.status_code).json(error);
    }

    const success = successResponse(
      AppointmentDeleted,
      "Appointment deleted successfuly"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error trying to delete the Appointment", 500);
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
    const AppointmentsGeted = await getAllUC.execute(patientIdFilter);

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
    const error = errorResponse("Error trying to get the Appointments", 500);
    res.status(error.status_code).json(error);
  }
};

export const getAppointmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { appointment_id } = req.params;
    console.log("Appointment ID:", appointment_id);

    const AppointmentGeted = await getOneUC.execute(
      parseInt(appointment_id)
    );

    if ((AppointmentGeted as IPrismaError).code) {
      const error = errorResponse(
        "No se pudo obtener la cita",
        500,
        AppointmentGeted
      );
      res.status(error.status_code).json(error);
    }

    const success = successResponse(
      AppointmentGeted,
      "Appointment geted successfuly"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error trying to get the Appointment", 500);
    res.status(error.status_code).json(error);
  }
};
