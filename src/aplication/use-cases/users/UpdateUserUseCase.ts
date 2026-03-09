import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { CreateUserDTO } from "../../dtos/user/CreateUserDTO";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class UpdateUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(user: CreateUserDTO, user_id: string, currentUserId: number): Promise<CreateUserDTO | null> {
    if (parseInt(user_id, 10) !== currentUserId) {
      throw new ForbiddenError();
    }
    return this.userRepository.updateUser(user, user_id);
  }
}
