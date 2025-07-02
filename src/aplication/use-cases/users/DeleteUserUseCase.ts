import { IUser } from "../../../domain/entities/IUser";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { BcryptHashService } from "../../../infrastructure/services/HashServiceImpl";
import { CreateUserDTO } from "../../dtos/user/CreateUserDTO";

export class DeleteUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
 

  }

  async execute(user_id:string): Promise<CreateUserDTO|null> {
    return this.userRepository.deleteUser(user_id);
  }
}
