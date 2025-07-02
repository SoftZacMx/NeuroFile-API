import { IUser } from "../../../domain/entities/IUser";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { IExpedientRepository } from "../../../domain/repositories/IExpedientsRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { BcryptHashService } from "../../../infrastructure/services/HashServiceImpl";
import { UpdateRecordDTO } from "../../dtos/expedients/UpdateExpedientDTO";
import { CreateUserDTO } from "../../dtos/user/CreateUserDTO";

export class UpdateExpedientUseCase {
  private expedientRepository: IExpedientRepository;

  constructor(expedientRepository: IExpedientRepository) {
    this.expedientRepository = expedientRepository;
 

  }

  async execute(user: UpdateRecordDTO,expedient_id:number): Promise<UpdateRecordDTO|IPrismaError> {
    return this.expedientRepository.updateRecord(user,expedient_id);
  }
}
