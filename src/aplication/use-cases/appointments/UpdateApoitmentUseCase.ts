import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { UpdateAppointmentDTO } from "../../dtos/appointments/AppointmentUpdateDTO";

export class UpdateAppointmentUseCase {
  constructor(private repo: IAppointmentRepository) {}
  async execute(id: number, dto: UpdateAppointmentDTO) {
    return await this.repo.updateAppointment(id, dto);
  }
}