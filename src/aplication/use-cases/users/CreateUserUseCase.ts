import { IUser } from "../../../domain/entities/IUser";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { BcryptHashService } from "../../../infrastructure/services/HashServiceImpl";
import { CreateUserDTO } from "../../dtos/user/CreateUserDTO";

export class CreateUserUseCase {
  private userRepository: IUserRepository;
  private hasService: BcryptHashService

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
    this.hasService =  new BcryptHashService()

  }

  async execute(user: CreateUserDTO): Promise<CreateUserDTO|null|IPrismaError> {
    user.password = await this.hasService.hash(user.password)
    return this.userRepository.createUser(user);
  }
}
