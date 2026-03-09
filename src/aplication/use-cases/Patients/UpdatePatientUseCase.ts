import { IPatient } from "../../../domain/entities/IPatients";
import { IPatientRepository } from "../../../domain/repositories/IPatientsRepository";
import { IUpdatePatientDTO } from "../../dtos/patients/UpdatePatientDTO";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class UpdatePatientUseCase {
  private patientRepository: IPatientRepository;

  constructor(patientRepository: IPatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(patient: IUpdatePatientDTO, user_id: string, currentUserId: number): Promise<IPatient | null | IPrismaError> {
    const existing = await this.patientRepository.getPatient(user_id);
    if (!existing || (typeof existing === "object" && "code" in existing)) return this.patientRepository.updatePatient(patient, user_id);
    if (existing.user_id !== currentUserId) throw new ForbiddenError();
    return this.patientRepository.updatePatient(patient, user_id);
  }
}
