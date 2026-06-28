import { DashboardScope } from "../../dtos/dashboard/DashboardScope";
import { DashboardTodayAppointmentDTO } from "../../dtos/dashboard/DashboardTodayAppointmentDTO";
import { IDashboardStatsRepository } from "../../../domain/repositories/IDashboardStatsRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";

export class GetDashboardTomorrowAppointmentsUseCase {
  constructor(private statsRepository: IDashboardStatsRepository) {}

  async execute(
    scope: DashboardScope
  ): Promise<DashboardTodayAppointmentDTO[] | IPrismaError> {
    return this.statsRepository.getTomorrowAppointments(scope);
  }
}
