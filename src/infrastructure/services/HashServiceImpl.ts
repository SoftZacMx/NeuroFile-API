// src/infrastructure/services/BcryptHashService.ts
import bcrypt from 'bcryptjs';
import { IHashService } from '../../domain/services/IHassService';

export class BcryptHashService implements IHashService {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(raw: string, hashed: string): Promise<boolean> {
    console.log('BcryptHashService compare',{raw:raw,hashed:hashed});
    
    return bcrypt.compare(raw, hashed);
  }
}
