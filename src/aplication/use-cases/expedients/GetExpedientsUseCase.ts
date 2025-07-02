import { IUser } from "../../../domain/entities/IUser";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { IExpedientRepository } from "../../../domain/repositories/IExpedientsRepository";
import { CreateRecordDTO } from "../../dtos/expedients/CreateExpedientDTO";
import { ExpedientDTO } from "../../dtos/expedients/ExpedientDTO";


export class GetExpedientsUseCase {
  private expedientsRepository: IExpedientRepository;

  constructor(expedientsRepository: IExpedientRepository) {
    this.expedientsRepository = expedientsRepository;
 

  }

  async execute(): Promise<ExpedientDTO[]|IPrismaError> {
    return this.expedientsRepository.getExpedients();
  }
}
