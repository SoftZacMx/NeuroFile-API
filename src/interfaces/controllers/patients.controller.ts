import { Request, Response } from "express";
import { CreateUserUseCase } from "../../aplication/use-cases/users/CreateUserUseCase";
import { UserRepositoryImpl } from "../../infrastructure/repositories/UserRepositoryImplementation";
import {
  successResponse,
  errorResponse,
  forbiddenResponse,
} from "../../shared/helpers/response.helper";
import { Messages, Codes } from "../../shared/constants/messages";
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
      const error = errorResponse(Messages.patient.createError, 500, undefined, Codes.CREATE_ERROR);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(newPatient, Messages.patient.createSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(Messages.patient.createFail, 500, undefined, Codes.CREATE_ERROR);
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
      const error = errorResponse(Messages.patient.updateError, 404, undefined, Codes.NOT_FOUND);
      res.status(error.status_code).json(error);
      return;
    }
    const success = successResponse(userUpdated, Messages.patient.updateSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.patient.updateFail, 500, undefined, Codes.UPDATE_ERROR);
    res.status(error.status_code).json(error);
  }
};

export const getPatientsController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.sub) {
      const error = errorResponse(Messages.patient.listUnauthorized, 401, undefined, Codes.UNAUTHORIZED);
      res.status(error.status_code).json(error);
      return;
    }
    const currentUserId = parseInt(req.user.sub, 10);
    const patientsGated = await getPatientsUseCase.execute(currentUserId);

    if (!patientsGated) {
      const error = errorResponse(Messages.patient.listError, 400, undefined, Codes.LIST_ERROR);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(patientsGated, Messages.patient.listSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(Messages.patient.listFail, 500, undefined, Codes.LIST_ERROR);
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
      const error = errorResponse(Messages.patient.notFound, 404, undefined, Codes.NOT_FOUND);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(patient, Messages.patient.getSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.patient.getFail, 500, undefined, Codes.GET_ERROR);
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
      const error = errorResponse(Messages.patient.summaryError, 500, undefined, Codes.GET_ERROR);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(summary, Messages.patient.summarySuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.patient.summaryFail, 500, undefined, Codes.GET_ERROR);
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
      const error = errorResponse(Messages.patient.deleteError, 404, undefined, Codes.NOT_FOUND);
      res.status(error.status_code).json(error);
      return;
    }
    const success = successResponse(patientDelete, Messages.patient.deleteSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.patient.deleteFail, 500, undefined, Codes.DELETE_ERROR);
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
