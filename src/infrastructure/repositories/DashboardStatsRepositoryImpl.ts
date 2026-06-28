import prisma from "../database/prisma/prisma.client";
import { DashboardScope } from "../../aplication/dtos/dashboard/DashboardScope";
import { IDashboardStatsRepository } from "../../domain/repositories/IDashboardStatsRepository";
import { DashboardStatsDTO } from "../../aplication/dtos/dashboard/DashboardStatsDTO";
import { DashboardTodayAppointmentDTO } from "../../aplication/dtos/dashboard/DashboardTodayAppointmentDTO";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";
import { mapPrismaError } from "../../domain/errors/IPrismaErrorsMapers";

function getTodayStartEnd(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start, end };
}

function getNextDayStartEnd(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59, 999);
  return { start, end };
}

function formatPatientName(patient: {
  first_name: string;
  last_name: string;
  second_last_name: string | null;
}): string {
  return [patient.first_name, patient.last_name, patient.second_last_name]
    .filter(Boolean)
    .join(" ");
}

function patientFilter(scope: DashboardScope) {
  return { user_id: scope.userId };
}

export class DashboardStatsRepositoryImpl implements IDashboardStatsRepository {
  private async getAppointmentsInRange(
    scope: DashboardScope,
    start: Date,
    end: Date
  ): Promise<DashboardTodayAppointmentDTO[] | IPrismaError> {
    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          patient: patientFilter(scope),
          date: { gte: start, lte: end },
          status: true,
        },
        include: {
          patient: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              second_last_name: true,
            },
          },
        },
        orderBy: { date: "asc" },
      });

      return appointments.map((appointment) => ({
        id: appointment.id,
        date: appointment.date.toISOString(),
        status: appointment.status,
        attended: appointment.attended,
        patientId: appointment.patient.id,
        patientName: formatPatientName(appointment.patient),
      }));
    } catch (error) {
      return mapPrismaError(error);
    }
  }

  async getStats(scope: DashboardScope): Promise<DashboardStatsDTO | IPrismaError> {
    try {
      const { start: todayStart, end: todayEnd } = getTodayStartEnd();
      const { start: nextDayStart, end: nextDayEnd } = getNextDayStartEnd();
      const patientScope = patientFilter(scope);

      const [activePatients, appointmentsToday, appointmentsNextDay] = await Promise.all([
        prisma.patient.count({
          where: { ...patientScope, is_active: true },
        }),
        prisma.appointment.count({
          where: {
            patient: patientScope,
            date: { gte: todayStart, lte: todayEnd },
            status: true,
          },
        }),
        prisma.appointment.count({
          where: {
            patient: patientScope,
            date: { gte: nextDayStart, lte: nextDayEnd },
            status: true,
          },
        }),
      ]);

      return {
        activePatients,
        appointmentsToday,
        appointmentsNextDay,
      };
    } catch (error) {
      return mapPrismaError(error);
    }
  }

  async getTodayAppointments(
    scope: DashboardScope
  ): Promise<DashboardTodayAppointmentDTO[] | IPrismaError> {
    const { start, end } = getTodayStartEnd();
    return this.getAppointmentsInRange(scope, start, end);
  }

  async getTomorrowAppointments(
    scope: DashboardScope
  ): Promise<DashboardTodayAppointmentDTO[] | IPrismaError> {
    const { start, end } = getNextDayStartEnd();
    return this.getAppointmentsInRange(scope, start, end);
  }
}
