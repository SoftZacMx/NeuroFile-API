import { ICreatePatientDTO } from "../../aplication/dtos/patients/CreatePatientDTO";
import { PatientListItemDTO } from "../../aplication/dtos/patients/PatientListItemDTO";
import { IPatient } from "../entities/IPatients";
import { IPrismaError } from "../errors/IPrismaErrors";
import { IUpdatePatientDTO } from "../../aplication/dtos/patients/UpdatePatientDTO";
export interface IPatientRepository {
  createPatient(
    Patient: ICreatePatientDTO
  ): Promise<IPatient | null | IPrismaError | IPrismaError>;
  updatePatient(
    Patient: IUpdatePatientDTO,
    Patient_id: string
  ): Promise<IPatient | null | IPrismaError>;
  getPatients(userId: number | null): Promise<PatientListItemDTO[] | null | IPrismaError>;
  deletePatient(Patient_id: string): Promise<IPatient | null | IPrismaError>;
  getPatient(Patient_id: string): Promise<IPatient | null | IPrismaError>;
}
