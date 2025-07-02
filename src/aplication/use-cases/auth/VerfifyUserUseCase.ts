
import { UserRepositoryImpl } from "../../../infrastructure/repositories/UserRepositoryImplementation";
import { BcryptHashService } from "../../../infrastructure/services/HashServiceImpl";
import { TokenService } from "../../../infrastructure/services/TokenServiceImpl";
import { TokenPayload } from "../../../domain/services/ITokenService";

export class VerifyUserUseCase {

   
   private userRepository:UserRepositoryImpl;
   private readonly hashService: BcryptHashService
   private readonly tokenService: TokenService

  constructor(userRepository:UserRepositoryImpl) {

    this.userRepository = new UserRepositoryImpl()
    this.hashService = new BcryptHashService()
    this.tokenService = new TokenService()

   
  }

  async execute(email: string): Promise<any | null> {

    console.log('email',email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('Usuario no encontrado');

    console.log('user found',user);
    

    return user
    
  }
}
