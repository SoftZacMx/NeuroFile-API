import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";

export class GetAppointmentUseCase {
  constructor(private repo: IAppointmentRepository) {}
  async execute(id: number) {
    return await this.repo.getAppointment(id);
  }
}