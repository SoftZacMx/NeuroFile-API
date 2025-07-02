import { IUser } from "../../../domain/entities/IUser";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { BcryptHashService } from "../../../infrastructure/services/HashServiceImpl";
import { CreateUserDTO } from "../../dtos/user/CreateUserDTO";
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
  ): Promise<ExpedientDTO  | IPrismaError> {
    return this.expedientRepository.createRecord(expedient);
  }
}
