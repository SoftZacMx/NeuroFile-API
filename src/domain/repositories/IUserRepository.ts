import { CreateUserDTO } from "../../aplication/dtos/user/CreateUserDTO";
import { IUser } from "../entities/IUser";
import { IPrismaError } from "../errors/IPrismaErrors";

export interface IUserRepository {
    createUser(user:CreateUserDTO): Promise<CreateUserDTO | null | IPrismaError>;
    updateUser(user:CreateUserDTO,user_id:string): Promise<CreateUserDTO | null>;
    deleteUser(user_id:string): Promise<CreateUserDTO | null>;
    getUsers(): Promise<(Omit<IUser, 'password'>)[] | null>;
    getUser(user_id:string): Promise<IUser|null>;

}