import { IUser } from "../../../domain/entities/IUser";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { IExpedientRepository } from "../../../domain/repositories/IExpedientsRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { BcryptHashService } from "../../../infrastructure/services/HashServiceImpl";
import { CreateRecordDTO } from "../../dtos/expedients/CreateExpedientDTO";
import { ExpedientDTO } from "../../dtos/expedients/ExpedientDTO";
import { CreateUserDTO } from "../../dtos/user/CreateUserDTO";

export class GetExpedientUseCase {
  private expedientsRepository: IExpedientRepository;

  constructor(expedientsRepository: IExpedientRepository) {
    this.expedientsRepository = expedientsRepository;
 

  }

  async execute(expedient_id:number): Promise<ExpedientDTO|IPrismaError|null> {
    return this.expedientsRepository.getExpedient(expedient_id);
  }
}
