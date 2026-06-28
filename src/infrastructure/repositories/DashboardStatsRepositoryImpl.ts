import prisma from "../database/prisma/prisma.client";
import { IDashboardStatsRepository } from "../../domain/repositories/IDashboardStatsRepository";
import { DashboardStatsDTO } from "../../aplication/dtos/dashboard/DashboardStatsDTO";
import { DashboardAppointmentDTO } from "../../aplication/dtos/dashboard/DashboardAppointmentDTO";
import type { DashboardDayScope } from "../../aplication/dtos/dashboard/DashboardAppointmentDTO";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";
import { mapPrismaError } from "../../domain/errors/IPrismaErrorsMapers";
import { getNextDayStartEnd, getTodayStartEnd } from "./dashboardDateRanges";

function formatPatientName(patient: {
  first_name: string;
  last_name: string;
  second_last_name: string | null;
}): string {
  return [patient.first_name, patient.last_name, patient.second_last_name]
    .filter(Boolean)
    .join(" ");
}

export class DashboardStatsRepositoryImpl implements IDashboardStatsRepository {
  async getStats(userId: number): Promise<DashboardStatsDTO | IPrismaError> {
    try {
      const { start: todayStart, end: todayEnd } = getTodayStartEnd();
      const { start: nextDayStart, end: nextDayEnd } = getNextDayStartEnd();

      const [activePatients, appointmentsToday, appointmentsNextDay] = await Promise.all([
        prisma.patient.count({
          where: { user_id: userId, is_active: true },
        }),
        prisma.appointment.count({
          where: {
            patient: { user_id: userId },
            date: { gte: todayStart, lte: todayEnd },
          },
        }),
        prisma.appointment.count({
          where: {
            patient: { user_id: userId },
            date: { gte: nextDayStart, lte: nextDayEnd },
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

  async getAppointmentsForDay(
    userId: number,
    day: DashboardDayScope
  ): Promise<DashboardAppointmentDTO[] | IPrismaError> {
    try {
      const { start, end } = day === "today" ? getTodayStartEnd() : getNextDayStartEnd();

      const appointments = await prisma.appointment.findMany({
        where: {
          patient: { user_id: userId },
          date: { gte: start, lte: end },
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
        patientId: appointment.patientId,
        patientName: formatPatientName(appointment.patient),
      }));
    } catch (error) {
      return mapPrismaError(error);
    }
  }
}
