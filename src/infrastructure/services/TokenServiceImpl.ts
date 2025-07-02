// src/infrastructure/services/TokenService.ts
import jwt from "jsonwebtoken";
import { ITokenService } from "../../domain/services/ITokenService";
import { TokenPayload } from "../../domain/models/TokenPayload";

export class TokenService implements ITokenService {
  private secret = process.env.JWT_SECRET || "default_secret";

  generate(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: payload.type === "access" ? "1h" : "15m",
    });
  }

  verify(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch(error:any) {
      console.log('Error verifying token', error.TokenExpiredError); 
      return null;
    }
  }
}
