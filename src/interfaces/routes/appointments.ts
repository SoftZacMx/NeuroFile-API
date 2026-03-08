import { Router } from "express";
import {
  createAppointmentController,
  updateAppointmentController,
  deleteAppointmentController,
  getAppointmentController,
  getAppointmentsController,
} from "../controllers/appointment.controller";
import { checkJWT } from "../middelwares/auth/checkJWT";
import { asyncHandler } from "../../shared/middelwares/asyncHandler";
import { createAppointmentValidator, updateAppointmentValidator } from "../middelwares/validators/appointments.validators";

const router = Router();

router.post("/", checkJWT, createAppointmentValidator, asyncHandler(createAppointmentController));
router.put("/:appointment_id", checkJWT, updateAppointmentValidator, asyncHandler(updateAppointmentController));
router.delete("/:appointment_id", checkJWT, asyncHandler(deleteAppointmentController));
router.get("/:appointment_id", checkJWT, asyncHandler(getAppointmentController));
router.get("/", checkJWT, asyncHandler(getAppointmentsController));

export { router };