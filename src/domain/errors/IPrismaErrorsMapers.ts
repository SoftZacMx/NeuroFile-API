import { Prisma } from "@prisma/client";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";

export function mapPrismaError(error: unknown): IPrismaError {
    console.log('Mapping Prisma error:', error);
    
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return {
          code: error.code,
          message: `El valor para el campo "${error.meta?.target}" ya existe.`,
        };
      case "P2003":
        return {
          code: error.code,
          message: "Referencia inválida: el campo relacionado no existe.",
        };
      case "P2025":
        return {
          code: error.code,
          message: "No se encontró el registro que se intentó modificar o eliminar.",
        };
      default:
        return {
          code: error.code,
          message: "Error conocido de Prisma: " + error.message,
        };
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      code: "VALIDATION_ERROR",
      message: "Error de validación: campos faltantes o mal formateados.",
    };
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return {
      code: "UNKNOWN_PRISMA_ERROR",
      message: "Error desconocido de Prisma.",
    };
  }

  return {
    code: "UNEXPECTED_ERROR",
    message: "Error inesperado al procesar la solicitud.",
  };
}
