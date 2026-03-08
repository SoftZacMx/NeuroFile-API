import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { handleValidatons } from "../validaitons.middleware";

/**
 * Valida que el body tenga exactamente uno de recordId o patientId (entero positivo).
 */
export const createConversationValidator = [
  body("recordId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("recordId debe ser un entero positivo"),
  body("patientId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("patientId debe ser un entero positivo"),
  body().custom((value, { req }) => {
    const recordId = req.body?.recordId;
    const patientId = req.body?.patientId;
    const hasRecord =
      recordId != null && recordId !== "" && !Number.isNaN(Number(recordId)) && Number(recordId) > 0;
    const hasPatient =
      patientId != null &&
      patientId !== "" &&
      !Number.isNaN(Number(patientId)) &&
      Number(patientId) > 0;
    if (hasRecord && hasPatient) {
      throw new Error("Envíe solo recordId o solo patientId");
    }
    if (!hasRecord && !hasPatient) {
      throw new Error("Envíe recordId o patientId");
    }
    return true;
  }),
  (req: Request, res: Response, next: NextFunction) => handleValidatons(req, res, next),
];
