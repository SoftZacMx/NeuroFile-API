import { IPatient } from "../../../domain/entities/IPatients";
import { IPatientRepository } from "../../../domain/repositories/IPatientsRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
export class GetPatientsUseCase {
  private patientsRepository: IPatientRepository;

  constructor(patientsRepository: IPatientRepository) {
    this.patientsRepository = patientsRepository;
  }

  async execute(): Promise<IPatient[] | null| IPrismaError> {
    return this.patientsRepository.getPatients();
  }
}
