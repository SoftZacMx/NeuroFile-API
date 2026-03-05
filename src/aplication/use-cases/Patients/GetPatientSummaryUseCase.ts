import { PatientSummaryDTO } from "../../dtos/patients/PatientSummaryDTO";
import { IPatientSummaryRepository } from "../../../domain/repositories/IPatientSummaryRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";

export class GetPatientSummaryUseCase {
  constructor(private summaryRepository: IPatientSummaryRepository) {}

  async execute(patientId: number): Promise<PatientSummaryDTO | IPrismaError> {
    return this.summaryRepository.getSummary(patientId);
  }
}
