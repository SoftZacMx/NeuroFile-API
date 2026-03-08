import { Router } from "express";
import { checkJWT } from "../middelwares/auth/checkJWT";
import { asyncHandler } from "../../shared/middelwares/asyncHandler";
import { getDashboardStatsController } from "../controllers/dashboard.controller";

const router = Router();

router.get("/stats", checkJWT, asyncHandler(getDashboardStatsController));

export { router };
