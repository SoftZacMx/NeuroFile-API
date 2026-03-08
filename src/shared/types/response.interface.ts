export interface Res<T = any> {
  error: boolean;
  result: boolean;
  data: T | null;
  message?: string;
  status_code: number;
  /** Código máquina para errores (ej. VALIDATION_ERROR, UNAUTHORIZED). */
  code?: string;
}
