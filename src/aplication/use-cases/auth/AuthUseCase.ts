
import { UserRepositoryImpl } from "../../../infrastructure/repositories/UserRepositoryImplementation";
import { BcryptHashService } from "../../../infrastructure/services/HashServiceImpl";
import { TokenService } from "../../../infrastructure/services/TokenServiceImpl";
import { TokenPayload } from "../../../domain/services/ITokenService";

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
    if (!user) throw new Error('Usuario no encontrado');


    console.log('password',password);
    console.log('user found',user);
    

    const isMatch = await this.hashService.compare(password, user.password);
    if (!isMatch) throw new Error('Contraseña incorrecta');

    const tokenPayload:TokenPayload = {
      sub: `${user.id}`,
      type: "access"
    }
    const token = await this.tokenService.generate(tokenPayload);
    return { token };
  }
}
