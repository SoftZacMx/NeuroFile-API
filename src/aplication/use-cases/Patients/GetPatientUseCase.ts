import { IPatient } from "../../../domain/entities/IPatients";
import { IPatientRepository } from "../../../domain/repositories/IPatientsRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
export class GetPatientUseCase {
  private patientRepostiroy: IPatientRepository;

  constructor(patientRepostiroy: IPatientRepository) {
    this.patientRepostiroy = patientRepostiroy;
 

  }

  async execute(user_id:string): Promise<IPatient|null| IPrismaError> {
    return this.patientRepostiroy.getPatient(user_id);
  }
}
