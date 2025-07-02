// src/domain/models/TokenPayload.ts
export interface TokenPayload {
  sub: string; // user ID
  type: 'access' | 'reset';
}
