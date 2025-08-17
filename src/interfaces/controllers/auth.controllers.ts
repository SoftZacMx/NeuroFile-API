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
      const error = errorResponse('The token was not generated', 500)
      res.status(error.status_code).json(error);
      return;  // Termina aquí, sin return res.
    }

    const success = successResponse(token, 'Login successfull')
    res.status(success.status_code).json(success);

    res.status(200).send({ error: false, data: token, message: 'Login successful' });
  } catch (error: any) {
    console.log('Auth - login - error: ', error);
    const error_response = errorResponse(error.message, 500)
    res.status(error_response.status_code).json(error);
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

    res.status(500).send({ error: true, message: 'Server error' });
  }
};

