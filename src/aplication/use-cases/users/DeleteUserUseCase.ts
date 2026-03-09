import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { CreateUserDTO } from "../../dtos/user/CreateUserDTO";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class DeleteUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(user_id: string, currentUserId: number): Promise<CreateUserDTO | null> {
    if (parseInt(user_id, 10) !== currentUserId) {
      throw new ForbiddenError();
    }
    return this.userRepository.deleteUser(user_id);
  }
}
