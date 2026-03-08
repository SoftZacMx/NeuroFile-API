import { Request, Response } from "express";
import { UserRepositoryImpl } from "../../infrastructure/repositories/UserRepositoryImplementation";
import { VerifyUserUseCase } from "../../aplication/use-cases/auth/VerfifyUserUseCase";
import { AuthUseCase } from "../../aplication/use-cases/auth/AuthUseCase";
import { errorResponse, successResponse } from "../../shared/helpers/response.helper";
const userRepository = new UserRepositoryImpl();

const verifyUseCase = new VerifyUserUseCase(userRepository);
const authUseCase = new AuthUseCase(userRepository);

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {

    const { email, password } = req.body;

    const token = await authUseCase.execute(email, password);




    if (!token) {
      const error = errorResponse("No se pudo generar el token", 500);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(token, 'Login successful');
    res.status(success.status_code).json(success);
  } catch (error: any) {
    console.log('Auth - login - error: ', error);
    const error_response = errorResponse(error?.message ?? "Error en login", 500);
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

