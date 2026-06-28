import type { DashboardAppointmentDTO, DashboardDayScope } from "../../aplication/dtos/dashboard/DashboardAppointmentDTO";
import { DashboardStatsDTO } from "../../aplication/dtos/dashboard/DashboardStatsDTO";
import { IPrismaError } from "../errors/IPrismaErrors";

export interface IDashboardStatsRepository {
  getStats(userId: number): Promise<DashboardStatsDTO | IPrismaError>;
  getAppointmentsForDay(
    userId: number,
    day: DashboardDayScope
  ): Promise<DashboardAppointmentDTO[] | IPrismaError>;
}
