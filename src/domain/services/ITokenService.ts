export interface TokenPayload {
  sub: string; // user ID
  type: 'access' | 'reset'; // tipo de token
}

export interface ITokenService {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload | null;
}