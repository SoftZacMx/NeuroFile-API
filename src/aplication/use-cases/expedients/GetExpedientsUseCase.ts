import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { IExpedientRepository } from "../../../domain/repositories/IExpedientsRepository";
import { ExpedientDTO } from "../../dtos/expedients/ExpedientDTO";

export class GetExpedientsUseCase {
  private expedientsRepository: IExpedientRepository;

  constructor(expedientsRepository: IExpedientRepository) {
    this.expedientsRepository = expedientsRepository;
  }

  async execute(patientId?: number): Promise<ExpedientDTO[] | IPrismaError> {
    return this.expedientsRepository.getExpedients(patientId);
  }
}
