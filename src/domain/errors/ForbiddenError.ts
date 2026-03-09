export class ForbiddenError extends Error {
  constructor(message = "No tiene permiso para acceder a este recurso.") {
    super(message);
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
