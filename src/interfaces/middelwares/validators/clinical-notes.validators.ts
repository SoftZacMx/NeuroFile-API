import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { handleValidatons } from "../validaitons.middleware";

const NOTE_MAX_LENGTH = 65535;

export const createClinicalNoteValidator = [
  body("recordId")
    .notEmpty()
    .withMessage("recordId es requerido")
    .isInt({ min: 1 })
    .withMessage("recordId debe ser un entero positivo"),
  body("date")
    .notEmpty()
    .withMessage("date es requerido")
    .isISO8601()
    .withMessage("date debe ser una fecha ISO 8601 válida"),
  body("note")
    .trim()
    .notEmpty()
    .withMessage("note es requerido")
    .isLength({ max: NOTE_MAX_LENGTH })
    .withMessage(`note no debe superar ${NOTE_MAX_LENGTH} caracteres`),
  (req: Request, res: Response, next: NextFunction) => handleValidatons(req, res, next),
];

export const updateClinicalNoteValidator = [
  body("date")
    .optional()
    .isISO8601()
    .withMessage("date debe ser una fecha ISO 8601 válida"),
  body("note")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("note no puede estar vacío")
    .isLength({ max: NOTE_MAX_LENGTH })
    .withMessage(`note no debe superar ${NOTE_MAX_LENGTH} caracteres`),
  (req: Request, res: Response, next: NextFunction) => handleValidatons(req, res, next),
];
