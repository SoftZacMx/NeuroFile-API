import { Request, Response } from "express";
import { UserRepositoryImpl } from "../../infrastructure/repositories/UserRepositoryImplementation";
import { VerifyUserUseCase } from "../../aplication/use-cases/auth/VerfifyUserUseCase";
import { AuthUseCase } from "../../aplication/use-cases/auth/AuthUseCase";
import { ForgotPasswordUseCase } from "../../aplication/use-cases/auth/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../../aplication/use-cases/auth/ResetPasswordUseCase";
import { errorResponse, successResponse } from "../../shared/helpers/response.helper";
import { Messages, Codes } from "../../shared/constants/messages";
const userRepository = new UserRepositoryImpl();

const verifyUseCase = new VerifyUserUseCase(userRepository);
const authUseCase = new AuthUseCase(userRepository);
const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository);

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {

    const { email, password } = req.body;

    const token = await authUseCase.execute(email, password);




    if (!token) {
      const error = errorResponse(Messages.auth.tokenError, 500, undefined, Codes.CREATE_ERROR);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(token, Messages.auth.loginSuccess);
    res.status(success.status_code).json(success);
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.log("Auth - login - error: ", err);
    const error_response = errorResponse(err?.message ?? Messages.auth.loginError, 500, undefined, Codes.CREATE_ERROR);
    res.status(error_response.status_code).json(error_response);
  }
};


export const verifyUserController = async (req: Request, res: Response): Promise<void> => {
  try {


    const { email } = req.body;
    const user = await verifyUseCase.execute(email);
    console.log('user controller', user);


    if (!user) {
      res.status(401).send({ error: true, message: 'User not found' });
      return;  // Termina aquí, sin return res.
    }

    res.status(200).send({ error: false, data: user, message: 'User found' });
  } catch (error) {
    console.log('Auth - verify user - error: ', error);

    res.status(500).json({
      error: true,
      result: false,
      data: null,
      message: "Error interno del servidor",
      status_code: 500,
    });

    
  }
};

export const forgotPasswordController = async (
  req: Request,
  res: Response

) : Promise<void> => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordUseCase.execute(email);
    const success = successResponse(result, result.message);
    res.status(success.status_code).json(success);
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.log("Auth - forgot password - error: ", err);
    const error_response = errorResponse(
      err?.message ?? Messages.auth.forgotPasswordError,
      500,
      undefined,
      Codes.CREATE_ERROR
    );
    res.status(error_response.status_code).json(error_response);
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, password } = req.body;
    const result = await resetPasswordUseCase.execute(token, password);
    const success = successResponse(result, result.message);
    res.status(success.status_code).json(success);
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.log("Auth - reset password - error: ", err);

    const message = err?.message ?? Messages.auth.resetPasswordError;
    let statusCode = 500;

    if (message === Messages.auth.resetPasswordInvalidToken) {
      statusCode = 400;
    } else if (message === Messages.auth.resetPasswordUserNotFound) {
      statusCode = 404;
    }

    const error_response = errorResponse(
      message,
      statusCode,
      undefined,
      Codes.UPDATE_ERROR
    );
    res.status(error_response.status_code).json(error_response);
  }
};

