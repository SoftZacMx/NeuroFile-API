import { PatientSummaryDTO } from "../../aplication/dtos/patients/PatientSummaryDTO";
import { IPrismaError } from "../errors/IPrismaErrors";

export interface IPatientSummaryRepository {
  getSummary(patientId: number): Promise<PatientSummaryDTO | IPrismaError>;
}
