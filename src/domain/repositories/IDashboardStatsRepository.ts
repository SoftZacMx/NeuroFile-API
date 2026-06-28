import { DashboardScope } from "../../aplication/dtos/dashboard/DashboardScope";
import { DashboardStatsDTO } from "../../aplication/dtos/dashboard/DashboardStatsDTO";
import { DashboardTodayAppointmentDTO } from "../../aplication/dtos/dashboard/DashboardTodayAppointmentDTO";
import { IPrismaError } from "../errors/IPrismaErrors";

export interface IDashboardStatsRepository {
  getStats(scope: DashboardScope): Promise<DashboardStatsDTO | IPrismaError>;
  getTodayAppointments(
    scope: DashboardScope
  ): Promise<DashboardTodayAppointmentDTO[] | IPrismaError>;
  getTomorrowAppointments(
    scope: DashboardScope
  ): Promise<DashboardTodayAppointmentDTO[] | IPrismaError>;
}
