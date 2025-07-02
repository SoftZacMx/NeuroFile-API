import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";

export class GetAppointmentsUseCase {
  constructor(private repo: IAppointmentRepository) {}
  async execute() {
    return await this.repo.getAppointments();
  }
}