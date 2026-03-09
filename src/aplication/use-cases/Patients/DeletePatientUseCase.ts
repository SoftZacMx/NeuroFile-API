import { IPatient } from "../../../domain/entities/IPatients";
import { IPatientRepository } from "../../../domain/repositories/IPatientsRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class DeletePatientUseCase {
  private patientRepository: IPatientRepository;

  constructor(patientRepository: IPatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(user_id: string, currentUserId: number): Promise<IPatient | null | IPrismaError> {
    const existing = await this.patientRepository.getPatient(user_id);
    if (!existing || (typeof existing === "object" && "code" in existing)) return this.patientRepository.deletePatient(user_id);
    if (existing.user_id !== currentUserId) throw new ForbiddenError();
    return this.patientRepository.deletePatient(user_id);
  }
}
