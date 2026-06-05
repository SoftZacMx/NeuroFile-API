import { UserRepositoryImpl } from "../../../infrastructure/repositories/UserRepositoryImplementation";
import { TokenService } from "../../../infrastructure/services/TokenServiceImpl";
import { BcryptHashService } from "../../../infrastructure/services/HashServiceImpl";
import { Messages } from "../../../shared/constants/messages";

export class ResetPasswordUseCase {
  private userRepository: UserRepositoryImpl;
  private readonly tokenService: TokenService;
  private readonly hashService: BcryptHashService;

  constructor(userRepository: UserRepositoryImpl) {
    this.userRepository = userRepository;
    this.tokenService = new TokenService();
    this.hashService = new BcryptHashService();
  }

  async execute(token: string, password: string): Promise<{ message: string }> {
    const payload = this.tokenService.verify(token);

    if (!payload || payload.type !== "reset") {
      throw new Error(Messages.auth.resetPasswordInvalidToken);
    }

    const user = await this.userRepository.getUser(payload.sub);
    if (!user) {
      throw new Error(Messages.auth.resetPasswordUserNotFound);
    }

    const hashedPassword = await this.hashService.hash(password);
    const updated = await this.userRepository.updatePassword(
      payload.sub,
      hashedPassword
    );

    if (!updated) {
      throw new Error(Messages.auth.resetPasswordUpdateError);
    }

    return { message: Messages.auth.resetPasswordSuccess };
  }
}
