import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IPatientRepository } from "../../../domain/repositories/IPatientsRepository";
import { CreateAppointmentDTO } from "../../dtos/appointments/AppointmentCreationDTO";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";
import { AppointmentDTO } from "../../dtos/appointments/AppointmentDTO";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";

export class CreateAppointmentUseCase {
  constructor(
    private repo: IAppointmentRepository,
    private patientRepo: IPatientRepository
  ) {}

  async execute(dto: CreateAppointmentDTO, currentUserId: number): Promise<AppointmentDTO | IPrismaError> {
    const patient = await this.patientRepo.getPatient(String(dto.patientId));
    if (!patient || (typeof patient === "object" && "code" in patient)) {
      throw new ForbiddenError();
    }
    if (patient.user_id !== currentUserId) {
      throw new ForbiddenError();
    }
    return this.repo.createAppointment(dto);
  }
}
