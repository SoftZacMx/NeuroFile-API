import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { UpdateAppointmentDTO } from "../../dtos/appointments/AppointmentUpdateDTO";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class UpdateAppointmentUseCase {
  constructor(private repo: IAppointmentRepository) {}
  async execute(id: number, dto: UpdateAppointmentDTO, currentUserId: number) {
    const appointment = await this.repo.getAppointment(id);
    if (!appointment || (typeof appointment === "object" && "code" in appointment)) return await this.repo.updateAppointment(id, dto);
    if ((appointment as { patient?: { user_id: number } }).patient?.user_id !== currentUserId) throw new ForbiddenError();
    return await this.repo.updateAppointment(id, dto);
  }
}