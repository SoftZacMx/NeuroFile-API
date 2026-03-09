import { Request, Response } from "express";
import { CreateUserUseCase } from "../../aplication/use-cases/users/CreateUserUseCase";
import { UserRepositoryImpl } from "../../infrastructure/repositories/UserRepositoryImplementation";
import {
  successResponse,
  errorResponse,
} from "../../shared/helpers/response.helper";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UpdateUserUseCase } from "../../aplication/use-cases/users/UpdateUserUseCase";
import { DeleteUserUseCase } from "../../aplication/use-cases/users/DeleteUserUseCase";
import { GetUsersUseCase } from "../../aplication/use-cases/users/GetUsersUseCase";
import { GetUserUseCase } from "../../aplication/use-cases/users/GetUserUseCase";
import { CreatePatientUseCase } from "../../aplication/use-cases/Patients/CreatePatientUseCase";
import { PatientRepositoryImplementation } from "../../infrastructure/repositories/PatientsRepositoryImplementation";
import { IPatientRepository } from "../../domain/repositories/IPatientsRepository";
import { UpdatePatientUseCase } from "../../aplication/use-cases/Patients/UpdatePatientUseCase";
import { GetPatientsUseCase } from "../../aplication/use-cases/Patients/GetPatientsUseCase";
import { DeletePatientUseCase } from "../../aplication/use-cases/Patients/DeletePatientUseCase";
import { GetPatientUseCase } from "../../aplication/use-cases/Patients/GetPatientUseCase";
import { GetPatientSummaryUseCase } from "../../aplication/use-cases/Patients/GetPatientSummaryUseCase";
import { PatientSummaryRepositoryImpl } from "../../infrastructure/repositories/PatientSummaryRepositoryImpl";
import { RequestWithUser } from "../../shared/types/RequestWithUser";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";

const patientRepository = new PatientRepositoryImplementation();
const summaryRepository = new PatientSummaryRepositoryImpl();
const createUserUseCase = new CreatePatientUseCase(patientRepository);
const updatePatientUseCase = new UpdatePatientUseCase(patientRepository);
const getPatientsUseCase = new GetPatientsUseCase(patientRepository);
const deletePatientUseCase = new DeletePatientUseCase(patientRepository);
const getPatientUseCase = new GetPatientUseCase(patientRepository);
const getPatientSummaryUseCase = new GetPatientSummaryUseCase(summaryRepository, patientRepository);

function isPrismaError(x: unknown): x is IPrismaError {
  return typeof x === "object" && x !== null && "code" in x;
}

export const createPatientController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let newPatient = await createUserUseCase.execute(req.body);

    if (newPatient == null) {
      const error = errorResponse("No pudo ser creado el paciente", 500);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(newPatient, "Paciente creado con éxito");
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al intentar crear el paciente", 500);
    res.status(error.status_code).json(error);
  }
};

export const updatePatientController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const patient_id = req.params.user_id;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const userUpdated = await updatePatientUseCase.execute(req.body, patient_id, currentUserId);
    if (!userUpdated || isPrismaError(userUpdated)) {
      const error = errorResponse("Paciente no encontrado o no fue posible actualizar.", 404);
      res.status(error.status_code).json(error);
      return;
    }
    const success = successResponse(userUpdated, "Paciente actualizado correctamente");
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ result: false, message: err.message });
      return;
    }
    console.error(err);
    const error = errorResponse("Error al actualizar el paciente", 500);
    res.status(error.status_code).json(error);
  }
};

export const getPatientsController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.sub) {
      const error = errorResponse("No autorizado para listar pacientes.", 401);
      res.status(error.status_code).json(error);
      return;
    }
    const loggedUserId = parseInt(req.user.sub, 10);
    const isAdmin = req.user.role === "admin";
    const filterUserId = isAdmin ? null : loggedUserId;
    const patientsGated = await getPatientsUseCase.execute(filterUserId);

    if (!patientsGated) {
      const error = errorResponse(
        "No fue posible obtener los pacientes.",
        400
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      patientsGated,
      "Pacientes obtenidos correctamente"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al obtener los pacientes", 500);
    res.status(error.status_code).json(error);
  }
};

export const getPatientController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const patient_id = req.params.user_id;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const patient = await getPatientUseCase.execute(patient_id, currentUserId);

    if (!patient || isPrismaError(patient)) {
      const error = errorResponse("Paciente no encontrado.", 404);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(patient, "Paciente encontrado");
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ result: false, message: err.message });
      return;
    }
    console.error(err);
    const error = errorResponse("Error al obtener el paciente", 500);
    res.status(error.status_code).json(error);
  }
};

export const getPatientSummaryController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const patient_id = req.params.user_id;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const summary = await getPatientSummaryUseCase.execute(parseInt(patient_id, 10), currentUserId);
    if (isPrismaError(summary)) {
      const error = errorResponse("Error al obtener el resumen.", 500);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(summary, "Resumen del paciente");
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ result: false, message: err.message });
      return;
    }
    console.error(err);
    const error = errorResponse("Error al obtener el resumen del paciente", 500);
    res.status(error.status_code).json(error);
  }
};

export const deletePatientController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const patient_id = req.params.user_id;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const patientDelete = await deletePatientUseCase.execute(patient_id, currentUserId);
    if (!patientDelete || isPrismaError(patientDelete)) {
      const error = errorResponse("Paciente no encontrado o no fue posible eliminar.", 404);
      res.status(error.status_code).json(error);
      return;
    }
    const success = successResponse(patientDelete, "Paciente eliminado correctamente");
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ result: false, message: err.message });
      return;
    }
    console.error(err);
    const error = errorResponse("Error al eliminar el paciente", 500);
    res.status(error.status_code).json(error);
  }
};

/*




export const getUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const userGeted = await getUserUseCase.execute(user_id);

    if (!userGeted) {
      const error = errorResponse("No fue posible encontrar el usuario.", 400);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(userGeted, "Users geted successfuly");
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al obtener el usuario", 500);
    res.status(error.status_code).json(error);
  }
};
*/
