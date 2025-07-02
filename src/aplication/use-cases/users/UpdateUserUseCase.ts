import { IUser } from "../../../domain/entities/IUser";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { BcryptHashService } from "../../../infrastructure/services/HashServiceImpl";
import { CreateUserDTO } from "../../dtos/user/CreateUserDTO";

export class UpdateUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
 

  }

  async execute(user: CreateUserDTO,user_id:string): Promise<CreateUserDTO|null> {
    return this.userRepository.updateUser(user,user_id);
  }
}
