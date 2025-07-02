// src/shared/types/RequestWithUser.ts
import { Request } from 'express';
import { TokenPayload } from '../../domain/services/ITokenService';

export interface RequestWithUser extends Request {
  user?: TokenPayload;
}
