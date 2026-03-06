"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_controllers_1 = require("../controllers/auth.controllers");
const router = (0, express_1.Router)();
exports.router = router;
/*
    EXAMPPLE-MIDDELWARE
    router.get("/" , checkJWT ,getExpedientes);
*/
router.post("/login", auth_controllers_1.loginController);
router.post("/verify-user", auth_controllers_1.verifyUserController);
