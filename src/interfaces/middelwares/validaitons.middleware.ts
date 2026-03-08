import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { errorResponse } from "../../shared/helpers/response.helper";

/**
 * Middleware que ejecuta el resultado de express-validator.
 * Si hay errores, responde 400 con formato unificado: error, message, errors.
 */
function handleValidatons(req: Request, res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }
  const errors = result.array();
  const payload = errorResponse("Datos de entrada inválidos", 400, errors, "VALIDATION_ERROR");
  res.status(payload.status_code).json(payload);
}

export { handleValidatons };