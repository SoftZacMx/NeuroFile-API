import { Router } from "express";
import { checkJWT } from "../middelwares/auth/checkJWT";
import { asyncHandler } from "../../shared/middelwares/asyncHandler";
import { createPatientValidator, updatePatientValidator } from "../middelwares/validators/patients.validators";
import {
  createPatientController,
  deletePatientController,
  getPatientsController,
  getPatientController,
  getPatientSummaryController,
  updatePatientController,
} from "../controllers/patients.controller";

const router = Router();

router.post("/", checkJWT, createPatientValidator, asyncHandler(createPatientController));
router.put("/:user_id", checkJWT, updatePatientValidator, asyncHandler(updatePatientController));
router.get("/", checkJWT, asyncHandler(getPatientsController));
router.get("/:user_id/summary", checkJWT, asyncHandler(getPatientSummaryController));
router.get("/:user_id", checkJWT, asyncHandler(getPatientController));
router.delete("/:user_id", checkJWT, asyncHandler(deletePatientController));

/*

*/



export {router};