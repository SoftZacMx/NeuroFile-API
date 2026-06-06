import { Router } from "express";
import { checkJWT } from "../middelwares/auth/checkJWT";
import { asyncHandler } from "../../shared/middelwares/asyncHandler";
import {
  getDashboardStatsController,
  getDashboardTodayAppointmentsController,
  getDashboardTomorrowAppointmentsController,
} from "../controllers/dashboard.controller";

const router = Router();

router.get("/stats", checkJWT, asyncHandler(getDashboardStatsController));
router.get(
  "/appointments/today",
  checkJWT,
  asyncHandler(getDashboardTodayAppointmentsController)
);
router.get(
  "/appointments/tomorrow",
  checkJWT,
  asyncHandler(getDashboardTomorrowAppointmentsController)
);

export { router };
