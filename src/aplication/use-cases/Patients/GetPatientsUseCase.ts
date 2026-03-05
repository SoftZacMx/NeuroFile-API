import { PatientListItemDTO } from "../../dtos/patients/PatientListItemDTO";
import { IPatientRepository } from "../../../domain/repositories/IPatientsRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
export class GetPatientsUseCase {
  private patientsRepository: IPatientRepository;

  constructor(patientsRepository: IPatientRepository) {
    this.patientsRepository = patientsRepository;
  }

  async execute(userId: number | null): Promise<PatientListItemDTO[] | null | IPrismaError> {
    return this.patientsRepository.getPatients(userId);
  }
}
