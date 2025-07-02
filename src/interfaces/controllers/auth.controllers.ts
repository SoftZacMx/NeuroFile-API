import { Request, Response } from "express";
import { UserRepositoryImpl } from "../../infrastructure/repositories/UserRepositoryImplementation";
import { VerifyUserUseCase } from "../../aplication/use-cases/auth/VerfifyUserUseCase";
import { AuthUseCase } from "../../aplication/use-cases/auth/AuthUseCase";
const userRepository = new UserRepositoryImpl();

const verifyUseCase = new VerifyUserUseCase(userRepository);
const authUseCase = new AuthUseCase(userRepository);

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('HOLA');
    
    const { email, password } = req.body;
    const token = await authUseCase.execute(email, password);
    console.log('token',token);
    

    if (!token) {
      res.status(401).send({ error: true, message: 'No token' });
      return;  // Termina aquí, sin return res.
    }

    res.status(200).send({ error: false, data: token, message: 'Login successful' });
  } catch (error) {
    console.log('Auth - login - error: ' , error);
    
    res.status(500).send({ error: true, message: 'Server error' });
  }
};


export const verifyUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    
    
    const { email } = req.body;
    const user = await verifyUseCase.execute(email);
    console.log('user controller',user);
    

    if (!user) {
      res.status(401).send({ error: true, message: 'User not found' });
      return;  // Termina aquí, sin return res.
    }

    res.status(200).send({ error: false, data: user, message: 'User found' });
  } catch (error) {
    console.log('Auth - verify user - error: ' , error);
    
    res.status(500).send({ error: true, message: 'Server error' });
  }
};

