import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { handleValidatons } from "../validaitons.middleware";

export const createAppointmentValidator = [
  body("patientId")
    .notEmpty()
    .withMessage("patientId es requerido")
    .isInt({ min: 1 })
    .withMessage("patientId debe ser un entero positivo"),
  body("date")
    .notEmpty()
    .withMessage("date es requerido")
    .isISO8601()
    .withMessage("date debe ser una fecha ISO 8601 válida"),
  body("status").optional().isBoolean().withMessage("status debe ser booleano"),
  body("attended").optional().isBoolean().withMessage("attended debe ser booleano"),
  (req: Request, res: Response, next: NextFunction) => handleValidatons(req, res, next),
];

export const updateAppointmentValidator = [
  body("date")
    .optional()
    .isISO8601()
    .withMessage("date debe ser una fecha ISO 8601 válida"),
  body("status").optional().isBoolean().withMessage("status debe ser booleano"),
  body("attended").optional().isBoolean().withMessage("attended debe ser booleano"),
  (req: Request, res: Response, next: NextFunction) => handleValidatons(req, res, next),
];
