// src/domain/models/TokenPayload.ts
export interface TokenPayload {
  sub: string; // user ID
  type: 'access' | 'reset';
  role?: string; // 'admin' | 'therapist' — para autorización (ej. solo admin o dueño puede editar/eliminar paciente)
}
