import type {
  DashboardAppointmentDTO,
  DashboardDayScope,
} from "../../dtos/dashboard/DashboardAppointmentDTO";
import type { IDashboardStatsRepository } from "../../../domain/repositories/IDashboardStatsRepository";
import type { IPrismaError } from "../../../domain/errors/IPrismaErrors";

export class GetDashboardDayAppointmentsUseCase {
  constructor(private statsRepository: IDashboardStatsRepository) {}

  async execute(
    userId: number,
    day: DashboardDayScope
  ): Promise<DashboardAppointmentDTO[] | IPrismaError> {
    return this.statsRepository.getAppointmentsForDay(userId, day);
  }
}
