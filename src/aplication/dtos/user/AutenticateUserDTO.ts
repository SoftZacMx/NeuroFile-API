import { IUser } from "../../../domain/entities/IUser";

export interface AutenticateUserDTO extends IUser{
    id:number;
}