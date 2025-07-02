
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { IPatientRepository } from "../../../domain/repositories/IPatientsRepository";
import { ICreatePatientDTO } from "../../dtos/patients/CreatePatientDTO";
import { IPatient } from "../../../domain/entities/IPatients";
export class CreatePatientUseCase {

  private patientRepository: IPatientRepository;

  constructor(patientRepository: IPatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(patient: ICreatePatientDTO): Promise<IPatient|null|IPrismaError| IPrismaError> {
    return this.patientRepository.createPatient(patient);
  }
}
