import { Request, Response, NextFunction } from "express";

/**
 * Asigna un identificador único a cada petición para trazabilidad en logs.
 * Debe registrarse antes de las rutas.
 */
export function requestIdMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  (req as Request & { requestId?: string }).requestId = id;
  next();
}
