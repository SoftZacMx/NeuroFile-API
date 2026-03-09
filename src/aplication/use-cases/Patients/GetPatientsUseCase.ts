import { PatientListItemDTO } from "../../dtos/patients/PatientListItemDTO";
import { IPatientRepository } from "../../../domain/repositories/IPatientsRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";

export class GetPatientsUseCase {
  private patientsRepository: IPatientRepository;

  constructor(patientsRepository: IPatientRepository) {
    this.patientsRepository = patientsRepository;
  }

  /**
   * Lista solo los pacientes del terapeuta (user_id === currentUserId).
   */
  async execute(currentUserId: number): Promise<PatientListItemDTO[] | null | IPrismaError> {
    return this.patientsRepository.getPatients(currentUserId);
  }
}
