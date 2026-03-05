import { DashboardStatsDTO } from "../../aplication/dtos/dashboard/DashboardStatsDTO";
import { IPrismaError } from "../errors/IPrismaErrors";

export interface IDashboardStatsRepository {
  getStats(userId: number): Promise<DashboardStatsDTO | IPrismaError>;
}
