import { UserRepositoryImpl } from "../../../infrastructure/repositories/UserRepositoryImplementation";
import { TokenService } from "../../../infrastructure/services/TokenServiceImpl";
import { EmailService } from "../../../infrastructure/services/EmailServiceImpl";
import { TokenPayload } from "../../../domain/models/TokenPayload";

const RESET_MESSAGE =
  "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.";

export class ForgotPasswordUseCase {
  private userRepository: UserRepositoryImpl;
  private readonly tokenService: TokenService;
  private readonly emailService: EmailService;

  constructor(userRepository: UserRepositoryImpl) {
    this.userRepository = userRepository;
    this.tokenService = new TokenService();
    this.emailService = new EmailService();
  }

  async execute(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email.trim());

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return { message: RESET_MESSAGE };
    }

    const tokenPayload: TokenPayload = {
      sub: `${user.id}`,
      type: "reset",
      role: user.role,
    };

    const token = this.tokenService.generate(tokenPayload);

    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    try {
      // Enviar email de recuperación
      await this.emailService.sendPasswordReset(email, resetLink);
      console.log(`[ForgotPassword] Email enviado exitosamente a: ${email}`);
    } catch (error) {
      console.error("[ForgotPassword] Error al enviar email:", error);
      // No lanzamos el error para no revelar si el email existe
      // El usuario siempre recibe el mismo mensaje
    }

    return { message: RESET_MESSAGE };
  }
}
