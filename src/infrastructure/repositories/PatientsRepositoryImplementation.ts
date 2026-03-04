import prisma from "../database/prisma/prisma.client";
import { IUser } from "../../domain/entities/IUser";
import { CreateUserDTO } from "../../aplication/dtos/user/CreateUserDTO";
import { Prisma } from "@prisma/client";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";
import { IPatient } from "../../domain/entities/IPatients";
import { ICreatePatientDTO } from "../../aplication/dtos/patients/CreatePatientDTO";
import { IUpdatePatientDTO } from "../../aplication/dtos/patients/UpdatePatientDTO";
import { mapPrismaError } from "../../domain/errors/IPrismaErrorsMapers";

export class PatientRepositoryImplementation {
  async createPatient(
    patient: ICreatePatientDTO
  ): Promise<IPatient | IPrismaError | null> {
    try {
      const newPatient = await prisma.patient.create({ data: patient });
      return newPatient;
    } catch (error: any) {
      return mapPrismaError(error);
    }
  }

  async updatePatient(
    patient: IUpdatePatientDTO,
    patient_id: string
  ): Promise<IPatient | null | IPrismaError> {
    try {
      const updatedPatient = await prisma.patient.update({
        where: { id: parseInt(patient_id) },
        data: patient,
      });
      return updatedPatient;
    } catch (error) {
      return mapPrismaError(error);
    }
  }

  async getPatients(userId: number | null): Promise<IPatient[] | null | IPrismaError> {
    try {
      const getPatients =
        userId === null
          ? await prisma.patient.findMany()
          : await prisma.patient.findMany({ where: { user_id: userId } });
      return getPatients;
    } catch (error) {
      return mapPrismaError(error);
    }
  }

  async deletePatient(user_id: string): Promise<IPatient | null | IPrismaError> {
    try {
      const deletedPatient = await prisma.patient.delete({
        where: { id: parseInt(user_id) },
      });
      return deletedPatient;
    } catch (error) {
      return mapPrismaError(error);
    }
  }

  async getPatient(id: string): Promise<IPatient | null | IPrismaError> {
    try {
      return prisma.patient.findFirst({ where: { id: parseInt(id) } });
    } catch (error) {
      return mapPrismaError(error);
    }
    
  }
}
