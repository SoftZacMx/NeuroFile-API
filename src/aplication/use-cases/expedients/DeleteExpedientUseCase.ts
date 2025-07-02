
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { CreateRecordDTO } from "../../dtos/expedients/CreateExpedientDTO";
import { IExpedientRepository } from "../../../domain/repositories/IExpedientsRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
export class DeleteExpedientUseCase {

  private expedientRepository: IExpedientRepository;

  constructor(expedientRepository: IExpedientRepository) {
    this.expedientRepository = expedientRepository;
 

  }

  async execute(expedient_id:string): Promise<CreateRecordDTO|IPrismaError> {
    return this.expedientRepository.deleteRecord(expedient_id);
  }
}
