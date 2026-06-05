
import { UserRepositoryImpl } from "../../../infrastructure/repositories/UserRepositoryImplementation";
import { BcryptHashService } from "../../../infrastructure/services/HashServiceImpl";
import { TokenService } from "../../../infrastructure/services/TokenServiceImpl";
import { TokenPayload } from "../../../domain/services/ITokenService";
import { Messages } from "../../../shared/constants/messages";

export class AuthUseCase {

   
   private userRepository:UserRepositoryImpl;
   private readonly hashService: BcryptHashService
   private readonly tokenService: TokenService

  constructor(userRepository:UserRepositoryImpl) {

    this.userRepository = new UserRepositoryImpl()
    this.hashService = new BcryptHashService()
    this.tokenService = new TokenService()

   
  }

  async execute(email: string, password: string): Promise<any | null> {

    

    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error(Messages.auth.loginInvalidCredentials);

    console.log('password',password);
    console.log('user found',user);

    const isMatch = await this.hashService.compare(password, user.password);
    if (!isMatch) throw new Error(Messages.auth.loginInvalidCredentials);

    const tokenPayload: TokenPayload = {
      sub: `${user.id}`,
      type: "access",
      role: user.role,
    };
    
    const token = await this.tokenService.generate(tokenPayload);
    return { token:token,user:user };
  }
}
