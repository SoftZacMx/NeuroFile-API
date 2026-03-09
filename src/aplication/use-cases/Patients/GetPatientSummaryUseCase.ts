import { PatientSummaryDTO } from "../../dtos/patients/PatientSummaryDTO";
import { IPatientSummaryRepository } from "../../../domain/repositories/IPatientSummaryRepository";
import { IPatientRepository } from "../../../domain/repositories/IPatientsRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class GetPatientSummaryUseCase {
  constructor(
    private summaryRepository: IPatientSummaryRepository,
    private patientRepository: IPatientRepository
  ) {}

  async execute(patientId: number, currentUserId: number): Promise<PatientSummaryDTO | IPrismaError> {
    const patient = await this.patientRepository.getPatient(String(patientId));
    if (!patient || (typeof patient === "object" && "code" in patient)) {
      return this.summaryRepository.getSummary(patientId);
    }
    if (patient.user_id !== currentUserId) throw new ForbiddenError();
    return this.summaryRepository.getSummary(patientId);
  }
}
