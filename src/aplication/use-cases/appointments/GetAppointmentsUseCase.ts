import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";

export class GetAppointmentsUseCase {
  constructor(private repo: IAppointmentRepository) {}
  async execute(patientId?: number) {
    return await this.repo.getAppointments(patientId);
  }
}