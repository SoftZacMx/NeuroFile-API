import { Router } from "express";
const router = Router();
import {
  createAppointmentController,
  updateAppointmentController,
  deleteAppointmentController,
  getAppointmentController,
  getAppointmentsController,
} from "../controllers/appointment.controller";
import { checkJWT } from "../middelwares/auth/checkJWT";

router.post("/", checkJWT, createAppointmentController);
router.put("/:appointment_id", checkJWT, updateAppointmentController);
router.delete("/:appointment_id", checkJWT, deleteAppointmentController);
router.get("/:appointment_id", checkJWT, getAppointmentController);
router.get("/", checkJWT, getAppointmentsController);

export { router };