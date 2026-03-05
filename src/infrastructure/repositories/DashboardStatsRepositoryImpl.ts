import prisma from "../database/prisma/prisma.client";
import { IDashboardStatsRepository } from "../../domain/repositories/IDashboardStatsRepository";
import { DashboardStatsDTO } from "../../aplication/dtos/dashboard/DashboardStatsDTO";
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
}
