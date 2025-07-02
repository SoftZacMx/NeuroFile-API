import { IPatient } from "../../../domain/entities/IPatients";
import { IPatientRepository } from "../../../domain/repositories/IPatientsRepository";
import { IUpdatePatientDTO } from "../../dtos/patients/UpdatePatientDTO";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
export class UpdatePatientUseCase {
  private patientRepository: IPatientRepository;

  constructor(patientRepository: IPatientRepository) {
    this.patientRepository = patientRepository;
 

  }

  async execute(patient: IUpdatePatientDTO,user_id:string): Promise<IPatient|null | IPrismaError> {
    return this.patientRepository.updatePatient(patient,user_id);
  }
}
