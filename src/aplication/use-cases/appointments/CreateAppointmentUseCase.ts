import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { CreateAppointmentDTO } from "../../dtos/appointments/AppointmentCreationDTO";

export class CreateAppointmentUseCase {
  constructor(private repo: IAppointmentRepository) {}
  async execute(dto: CreateAppointmentDTO) {
    return await this.repo.createAppointment(dto);
  }
}
