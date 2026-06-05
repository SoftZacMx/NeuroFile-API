import prisma from "../database/prisma/prisma.client";
import { IUser } from "../../domain/entities/IUser";
import { CreateUserDTO } from "../../aplication/dtos/user/CreateUserDTO";
import { Prisma } from "@prisma/client";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";

export class UserRepositoryImpl {
  async findByEmail(email: string): Promise<IUser | null> {
    return prisma.user.findFirst({ where: { email } });
  }

  async createUser(
    user: CreateUserDTO
  ): Promise<CreateUserDTO | IPrismaError | null> {
    try {
      const newUser = await prisma.user.create({ data: user });
      return newUser;
    } catch (error:any) {
      console.error("Error creating user:", error);
      return null
    }
  }

  async updateUser(
    user: CreateUserDTO,
    user_id: string
  ): Promise<CreateUserDTO | null> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(user_id) },
        data: user,
      });
      return updatedUser;
    } catch (error) {
      console.error("Error updating the user:", error);
      return null;
    }
  }

  async deleteUser(user_id: string): Promise<CreateUserDTO | null> {
    try {
      const updatedUser = await prisma.user.delete({
        where: { id: parseInt(user_id) },
      });
      return updatedUser;
    } catch (error) {
      console.error("Error deleting the user:", error);
      return null;
    }
  }

  async getUsers(): Promise<(Omit<IUser, 'password'>)[] | null> {
    try {
      const getUsers = await prisma.user.findMany({ omit: { password: true } });
      return getUsers;
    } catch (error) {
      console.error("Error geting the users:", error);
      return null;
    }
  }

  async updatePassword(user_id: string, password: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: parseInt(user_id) },
        data: { password },
      });
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      return false;
    }
  }

  async getUser(id: string): Promise<IUser | null> {
    try {
      const getUser = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });
      return getUser;
    } catch (error) {
      console.error("Error geting the user:", error);
      return null;
    }
  }
}
