import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";

export class DeleteAppointmentUseCase {
  constructor(private repo: IAppointmentRepository) {}
  async execute(id: number) {
    return await this.repo.deleteAppointment(id);
  }
}