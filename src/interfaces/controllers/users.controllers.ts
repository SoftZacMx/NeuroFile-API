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
import { RequestWithUser } from "../../shared/types/RequestWithUser";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";

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
      const error = errorResponse(Messages.user.createError, 500, undefined, Codes.CREATE_ERROR);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(newUser, Messages.user.createSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(Messages.user.createFail, 500, undefined, Codes.CREATE_ERROR);
    res.status(error.status_code).json(error);
  }
};

export const updateUserController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const userUpdated = await updateUserUseCase.execute(req.body, user_id, currentUserId);

    if (!userUpdated) {
      const error = errorResponse(Messages.user.updateError, 400, undefined, Codes.UPDATE_ERROR);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(userUpdated, Messages.user.updateSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.user.updateFail, 500, undefined, Codes.UPDATE_ERROR);
    res.status(error.status_code).json(error);
  }
};

export const deleteUserController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const userDeleted = await deleteUserUseCase.execute(user_id, currentUserId);

    if (!userDeleted) {
      const error = errorResponse(Messages.user.deleteError, 400, undefined, Codes.DELETE_ERROR);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(userDeleted, Messages.user.deleteSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.user.deleteFail, 500, undefined, Codes.DELETE_ERROR);
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
      const error = errorResponse(Messages.user.listError, 400, undefined, Codes.LIST_ERROR);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(usersGeted, Messages.user.listSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(Messages.user.listFail, 500, undefined, Codes.LIST_ERROR);
    res.status(error.status_code).json(error);
  }
};

export const getUserController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const userGeted = await getUserUseCase.execute(user_id, currentUserId);

    if (!userGeted) {
      const error = errorResponse(Messages.user.notFound, 400, undefined, Codes.NOT_FOUND);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(userGeted, Messages.user.getSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.user.getFail, 500, undefined, Codes.GET_ERROR);
    res.status(error.status_code).json(error);
  }
};
