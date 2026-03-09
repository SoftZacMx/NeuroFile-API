import { Request, Response, NextFunction } from "express";
import { errorResponse, forbiddenResponse } from "../helpers/response.helper";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Middleware global de errores (4 argumentos).
 * Debe registrarse después de todas las rutas para capturar errores no manejados
 * y rechazos de promesas que lleguen vía next(err).
 */
export function globalErrorHandler(
  err: Error & { statusCode?: number; status?: number },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ForbiddenError) {
    res.status(403).json(forbiddenResponse(err.message));
    return;
  }
  const statusCode = err.statusCode ?? err.status ?? 500;
  const requestId = (req as Request & { requestId?: string }).requestId ?? "-";

  if (!isProduction) {
    console.error(`[globalErrorHandler] requestId=${requestId}`, err.message, err.stack);
  } else {
    console.error(`[globalErrorHandler] requestId=${requestId}`, err.message);
  }

  const message =
    statusCode >= 500 && isProduction
      ? "Error interno del servidor"
      : err.message || "Error interno del servidor";

  const code = statusCode >= 500 ? "INTERNAL_ERROR" : undefined;
  const payload = errorResponse(message, statusCode, null, code);
  res.status(payload.status_code).json(payload);
}
