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

const patientRepository = new PatientRepositoryImplementation();
const createUserUseCase = new CreatePatientUseCase(patientRepository);
const updatePatientUseCase = new UpdatePatientUseCase(patientRepository);
const getPatientsUseCase = new GetPatientsUseCase(patientRepository);
const deletePatientUseCase = new DeletePatientUseCase(patientRepository);
const getPatientUseCase = new GetPatientsUseCase(patientRepository);

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
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const userUpdated = await updatePatientUseCase.execute(req.body, user_id);

    if (!userUpdated) {
      const error = errorResponse(
        "It was not possible to update the patient.",
        400
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(userUpdated, "Patient updated successfuly");
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error trying to update the patient", 500);
    res.status(error.status_code).json(error);
  }
};

export const getPatientsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const patientsGated = await getPatientsUseCase.execute();

    if (!patientsGated) {
      const error = errorResponse(
        "It was not possible to get the patients.",
        400
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      patientsGated,
      "Patients geted successfuly"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error trying to get the patients", 500);
    res.status(error.status_code).json(error);
  }
};

export const deletePatientController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const patientDelete = await deletePatientUseCase.execute(user_id);

    console.log("patientDelete", patientDelete);
    

    if (!patientDelete) {
      const error = errorResponse(
        "It was not possible to delete the patient.",
        400
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(patientDelete, "Patient deleted successfuly");
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error trying to delete the patient", 500);
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
      const error = errorResponse("It was not possible to find the user.", 400);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(userGeted, "Users geted successfuly");
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error trying to get the user", 500);
    res.status(error.status_code).json(error);
  }
};
*/
