"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPrismaError = mapPrismaError;
const client_1 = require("@prisma/client");
function mapPrismaError(error) {
    var _a;
    console.log('Mapping Prisma error:', error);
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                return {
                    code: error.code,
                    message: `El valor para el campo "${(_a = error.meta) === null || _a === void 0 ? void 0 : _a.target}" ya existe.`,
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
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        return {
            code: "VALIDATION_ERROR",
            message: "Error de validación: campos faltantes o mal formateados.",
        };
    }
    if (error instanceof client_1.Prisma.PrismaClientUnknownRequestError) {
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
