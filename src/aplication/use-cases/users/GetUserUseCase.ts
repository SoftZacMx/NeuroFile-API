import { IUser } from "../../../domain/entities/IUser";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class GetUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(user_id: string, currentUserId: number): Promise<IUser | null> {
    if (parseInt(user_id, 10) !== currentUserId) {
      throw new ForbiddenError();
    }
    return this.userRepository.getUser(user_id);
  }
}
