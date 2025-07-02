import { IUser } from "../entities/IUser";

export interface IAuthRepository {
  authenticateUser(email: string,password:string): Promise<IUser | null>;
}