import prisma from "../database/prisma/prisma.client";
import { IUser } from "../../domain/entities/IUser";
import { CreateUserDTO } from "../../aplication/dtos/user/CreateUserDTO";
import { Prisma } from "@prisma/client";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";
import { IPatient } from "../../domain/entities/IPatients";
import { ICreatePatientDTO } from "../../aplication/dtos/patients/CreatePatientDTO";
import { IUpdatePatientDTO } from "../../aplication/dtos/patients/UpdatePatientDTO";
import { PatientListItemDTO } from "../../aplication/dtos/patients/PatientListItemDTO";
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

  async getPatients(userId: number | null): Promise<PatientListItemDTO[] | null | IPrismaError> {
    try {
      const patients = await prisma.patient.findMany({
        where: userId === null ? undefined : { user_id: userId },
        include: {
          appointments: {
            orderBy: { date: "desc" },
            take: 1,
          },
        },
      });
      return patients.map((p) => {
        const { appointments, ...patient } = p;
        const last = appointments[0];
        const last_appointment = last
          ? {
              id: last.id,
              date: last.date,
              status: last.status,
              attended: last.attended,
              patientId: last.patientId,
            }
          : null;
        return { ...patient, last_appointment } as PatientListItemDTO;
      });
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
