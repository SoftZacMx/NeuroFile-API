import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class DeleteAppointmentUseCase {
  constructor(private repo: IAppointmentRepository) {}
  async execute(id: number, currentUserId: number) {
    const appointment = await this.repo.getAppointment(id);
    if (!appointment || (typeof appointment === "object" && "code" in appointment)) return await this.repo.deleteAppointment(id);
    if ((appointment as { patient?: { user_id: number } }).patient?.user_id !== currentUserId) throw new ForbiddenError();
    return await this.repo.deleteAppointment(id);
  }
}