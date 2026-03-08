import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { handleValidatons } from "../validaitons.middleware";

const MAX_TEXT = 191;

export const createExpedientValidator = [
  body("patient_id")
    .notEmpty()
    .withMessage("patient_id es requerido")
    .isInt({ min: 1 })
    .withMessage("patient_id debe ser un entero positivo"),
  body("consultation_reason").optional().trim().isLength({ max: MAX_TEXT }),
  body("treatment_demand").optional().trim().isLength({ max: MAX_TEXT }),
  body("incident_details").optional().trim().isLength({ max: MAX_TEXT }),
  body("physical_description").optional().trim().isLength({ max: MAX_TEXT }),
  body("school_area").optional().trim().isLength({ max: MAX_TEXT }),
  body("work_area").optional().trim().isLength({ max: MAX_TEXT }),
  body("significant_events").optional().trim().isLength({ max: MAX_TEXT }),
  body("psychosexual_history").optional().trim().isLength({ max: MAX_TEXT }),
  body("family_diagram").optional().trim().isLength({ max: MAX_TEXT }),
  body("family_relationship").optional().trim().isLength({ max: MAX_TEXT }),
  body("family_mapping").optional().trim().isLength({ max: MAX_TEXT }),
  body("family_hypothesis").optional().trim().isLength({ max: MAX_TEXT }),
  body("therapeutic_focus").optional().trim().isLength({ max: MAX_TEXT }),
  body("therapeutic_goal").optional().trim().isLength({ max: MAX_TEXT }),
  body("therapeutic_strategy").optional().trim().isLength({ max: MAX_TEXT }),
  body("therapeutic_forecast").optional().trim().isLength({ max: MAX_TEXT }),
  body("mental_exam").optional().trim().isLength({ max: MAX_TEXT }),
  body("diagnostic_impression").optional().trim().isLength({ max: MAX_TEXT }),
  body("diagnostic_notes").optional().trim().isLength({ max: MAX_TEXT }),
  (req: Request, res: Response, next: NextFunction) => handleValidatons(req, res, next),
];

export const updateExpedientValidator = createExpedientValidator;
