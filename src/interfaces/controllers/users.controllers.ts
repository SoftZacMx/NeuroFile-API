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

const userRepository = new UserRepositoryImpl();
const createUserUseCase = new CreateUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
const getUsersUseCase = new GetUsersUseCase(userRepository);
const getUserUseCase = new GetUserUseCase(userRepository);

export const createUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newUser = await createUserUseCase.execute(req.body);

    console.log("user creation user", newUser);

    if (newUser == null) {
      const error = errorResponse('No pudo ser creado el usuario',500)
      res.status(error.status_code).json(error);
    }

    const success = successResponse(newUser, "Usuario creado con éxito");
    res.status(success.status_code).json(success);
    
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al intentar crear el usario", 500);
    res.status(error.status_code).json(error);
  }
};

export const updateUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const userUpdated = await updateUserUseCase.execute(req.body, user_id);

    if (!userUpdated) {
      const error = errorResponse(
        "It was not possible to update the user.",
        400
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(userUpdated, "User updated successfuly");
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error trying to update the user", 500);
    res.status(error.status_code).json(error);
  }
};

export const deleteUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const userDeleted = await deleteUserUseCase.execute(user_id);

    if (!userDeleted) {
      const error = errorResponse(
        "It was not possible to delete the user.",
        400
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(userDeleted, "User deleted successfuly");
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error trying to delete the user", 500);
    res.status(error.status_code).json(error);
  }
};

export const getUsersController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const usersGeted = await getUsersUseCase.execute();

    if (!usersGeted) {
      const error = errorResponse("It was not possible to get the users.", 400);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(usersGeted, "Users geted successfuly");
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error trying to get the users", 500);
    res.status(error.status_code).json(error);
  }
};

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
