import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { ExpedientAlreadyExistsError } from "../../../domain/errors/ExpedientAlreadyExistsError";
import { IExpedientRepository } from "../../../domain/repositories/IExpedientsRepository";
import { CreateRecordDTO } from "../../dtos/expedients/CreateExpedientDTO";
import { ExpedientDTO } from "../../dtos/expedients/ExpedientDTO";

export class CreateExpedientUseCase {
  private expedientRepository: IExpedientRepository;

  constructor(expedientRepository: IExpedientRepository) {
    this.expedientRepository = expedientRepository;
  }

  async execute(
    expedient: CreateRecordDTO
  ): Promise<ExpedientDTO | IPrismaError> {
    const existing = await this.expedientRepository.findByPatientId(
      expedient.patient_id
    );
    if (existing) {
      throw new ExpedientAlreadyExistsError();
    }
    return this.expedientRepository.createRecord(expedient);
  }
}
