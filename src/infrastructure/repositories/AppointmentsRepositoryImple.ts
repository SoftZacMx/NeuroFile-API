import prisma from "../database/prisma/prisma.client";
import { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";
import { CreateAppointmentDTO } from "../../aplication/dtos/appointments/AppointmentCreationDTO";
import { UpdateAppointmentDTO } from "../../aplication/dtos/appointments/AppointmentUpdateDTO";
import { mapPrismaError } from "../../domain/errors/IPrismaErrorsMapers";

export class AppointmentRepositoryImpl implements IAppointmentRepository {
  async createAppointment(dto: CreateAppointmentDTO) {
    try {
      return await prisma.appointment.create({ data: dto });
    } catch (error) {
      return mapPrismaError(error);
    }
  }

  async updateAppointment(id: number, dto: UpdateAppointmentDTO) {
    try {
      return await prisma.appointment.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      return mapPrismaError(error);
    }
  }

  async deleteAppointment(id: number) {
    try {
      return await prisma.appointment.delete({ where: { id } });
    } catch (error) {
      return mapPrismaError(error);
    }
  }

  async getAppointment(id: number) {
    try {
      return await prisma.appointment.findUnique({ where: { id } });
    } catch (error) {
      return mapPrismaError(error);
    }
  }

  async getAppointments(patientId?: number) {
    try {
      return await prisma.appointment.findMany({
        where: patientId != null ? { patientId } : undefined,
      });
    } catch (error) {
      return mapPrismaError(error);
    }
  }
}