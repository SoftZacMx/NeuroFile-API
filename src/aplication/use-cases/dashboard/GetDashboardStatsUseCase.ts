import { DashboardStatsDTO } from "../../dtos/dashboard/DashboardStatsDTO";
import { IDashboardStatsRepository } from "../../../domain/repositories/IDashboardStatsRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";

export class GetDashboardStatsUseCase {
  constructor(private statsRepository: IDashboardStatsRepository) {}

  async execute(userId: number): Promise<DashboardStatsDTO | IPrismaError> {
    return this.statsRepository.getStats(userId);
  }
}
