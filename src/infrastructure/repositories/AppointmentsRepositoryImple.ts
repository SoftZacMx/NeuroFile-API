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
      return await prisma.appointment.findUnique({
        where: { id },
        include: { patient: { select: { user_id: true } } },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.toLowerCase().includes("not found")) {
        return { code: "P2025", message: "No se encontró el registro que se intentó consultar." };
      }
      return mapPrismaError(error);
    }
  }

  async getAppointments(
    patientId?: number,
    dateFrom?: string,
    dateTo?: string
  ) {
    try {
      const conditions: { patientId?: number; date?: { gte?: Date; lte?: Date } } = {};
      if (patientId != null) conditions.patientId = patientId;
      if (dateFrom != null || dateTo != null) {
        conditions.date = {};
        if (dateFrom != null) {
          conditions.date.gte = new Date(`${dateFrom}T00:00:00.000Z`);
        }
        if (dateTo != null) {
          conditions.date.lte = new Date(`${dateTo}T23:59:59.999Z`);
        }
      }
      return await prisma.appointment.findMany({
        where: Object.keys(conditions).length ? conditions : undefined,
      });
    } catch (error) {
      return mapPrismaError(error);
    }
  }
}