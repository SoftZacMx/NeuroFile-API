import { IPatient } from "../../../domain/entities/IPatients";
import { IPatientRepository } from "../../../domain/repositories/IPatientsRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
export class DeletePatientUseCase {
  private patientRepository: IPatientRepository;

  constructor(patientRepository: IPatientRepository) {
    this.patientRepository = patientRepository;
 

  }

  async execute(user_id:string): Promise<IPatient|null| IPrismaError> {
    return this.patientRepository.deletePatient(user_id);
  }
}
