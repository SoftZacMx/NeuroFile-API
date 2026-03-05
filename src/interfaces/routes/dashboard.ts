import { Router } from "express";
import { checkJWT } from "../middelwares/auth/checkJWT";
import { getDashboardStatsController } from "../controllers/dashboard.controller";

const router = Router();

router.get("/stats", checkJWT, getDashboardStatsController);

export { router };
