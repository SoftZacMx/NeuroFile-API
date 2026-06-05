/** Minutos de validez del JWT de recuperación de contraseña (type: reset). */
export const RESET_TOKEN_EXPIRES_MINUTES = parseInt(
  process.env.RESET_TOKEN_EXPIRES_MINUTES ?? "30",
  10
);

export const RESET_TOKEN_EXPIRES_IN = `${RESET_TOKEN_EXPIRES_MINUTES}m` as const;
