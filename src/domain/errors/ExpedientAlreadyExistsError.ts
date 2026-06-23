export class ExpedientAlreadyExistsError extends Error {
  constructor(
    message = "This patient already has a clinical record."
  ) {
    super(message);
    this.name = "ExpedientAlreadyExistsError";
    Object.setPrototypeOf(this, ExpedientAlreadyExistsError.prototype);
  }
}
