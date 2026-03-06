"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const checkJWT_1 = require("../middelwares/auth/checkJWT");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const router = (0, express_1.Router)();
exports.router = router;
router.get("/stats", checkJWT_1.checkJWT, dashboard_controller_1.getDashboardStatsController);
