import { Res } from "../types/response.interface";
import { Codes, Messages } from "../constants/messages";

export const successResponse = <T>(data: T, message = "Éxito"): Res<T> => ({
  error: false,
  result: true,
  data,
  message,
  status_code: 200,
});

export interface ErrorResponseOptions {
  message: string;
  status_code?: number;
  data?: unknown;
  code?: string;
}

export const errorResponse = <T>(
  message: string,
  status_code = 500,
  data?: unknown,
  code?: string
): Res<T> => ({
  error: true,
  result: false,
  data: (data ?? null) as T | null,
  message,
  status_code,
  ...(code ? { code } : {}),
});

/** Respuesta 403 estándar (ownership). Acepta mensaje opcional (p. ej. err.message). */
export const forbiddenResponse = (message?: string) => ({
  result: false,
  code: Codes.FORBIDDEN,
  message: message ?? Messages.common.forbidden,
});
