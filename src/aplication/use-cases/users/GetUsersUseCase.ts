import { IUser } from "../../../domain/entities/IUser";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { BcryptHashService } from "../../../infrastructure/services/HashServiceImpl";
import { CreateUserDTO } from "../../dtos/user/CreateUserDTO";

export class GetUsersUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
 

  }

  async execute(): Promise<IUser[]|null> {
    return this.userRepository.getUsers();
  }
}
