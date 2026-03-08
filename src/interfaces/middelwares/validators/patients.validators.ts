import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { handleValidatons } from "../validaitons.middleware";

const MAX_STRING = 191;

export const createPatientValidator = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("first_name es requerido")
    .isLength({ max: MAX_STRING })
    .withMessage("first_name no debe superar 191 caracteres"),
  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("last_name es requerido")
    .isLength({ max: MAX_STRING })
    .withMessage("last_name no debe superar 191 caracteres"),
  body("second_last_name")
    .optional()
    .trim()
    .isLength({ max: MAX_STRING })
    .withMessage("second_last_name no debe superar 191 caracteres"),
  body("age").trim().notEmpty().withMessage("age es requerido"),
  body("gender").trim().notEmpty().withMessage("gender es requerido"),
  body("address").optional().trim(),
  body("is_active").optional().isBoolean().withMessage("is_active debe ser booleano"),
  body("occupation").trim().notEmpty().withMessage("occupation es requerido"),
  body("phone").trim().notEmpty().withMessage("phone es requerido"),
  body("user_id")
    .notEmpty()
    .withMessage("user_id es requerido")
    .isInt({ min: 1 })
    .withMessage("user_id debe ser un entero positivo"),
  (req: Request, res: Response, next: NextFunction) => handleValidatons(req, res, next),
];

export const updatePatientValidator = [
  body("first_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("first_name no puede estar vacío")
    .isLength({ max: MAX_STRING })
    .withMessage("first_name no debe superar 191 caracteres"),
  body("last_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("last_name no puede estar vacío")
    .isLength({ max: MAX_STRING })
    .withMessage("last_name no debe superar 191 caracteres"),
  body("second_last_name")
    .optional()
    .trim()
    .isLength({ max: MAX_STRING })
    .withMessage("second_last_name no debe superar 191 caracteres"),
  body("age").optional().trim().notEmpty().withMessage("age no puede estar vacío"),
  body("gender").optional().trim().notEmpty().withMessage("gender no puede estar vacío"),
  body("address").optional().trim(),
  body("is_active").optional().isBoolean().withMessage("is_active debe ser booleano"),
  body("occupation").optional().trim().notEmpty().withMessage("occupation no puede estar vacío"),
  body("phone").optional().trim().notEmpty().withMessage("phone no puede estar vacío"),
  (req: Request, res: Response, next: NextFunction) => handleValidatons(req, res, next),
];
