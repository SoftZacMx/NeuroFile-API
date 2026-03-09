import { IPatient } from "../../../domain/entities/IPatients";
import { IPatientRepository } from "../../../domain/repositories/IPatientsRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class GetPatientUseCase {
  private patientRepostiroy: IPatientRepository;

  constructor(patientRepostiroy: IPatientRepository) {
    this.patientRepostiroy = patientRepostiroy;
  }

  async execute(user_id: string, currentUserId: number): Promise<IPatient | null | IPrismaError> {
    const patient = await this.patientRepostiroy.getPatient(user_id);
    if (!patient || typeof patient === "object" && "code" in patient) return patient as IPatient | null | IPrismaError;
    if (patient.user_id !== currentUserId) throw new ForbiddenError();
    return patient;
  }
}
