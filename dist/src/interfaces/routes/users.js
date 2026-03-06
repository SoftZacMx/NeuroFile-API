"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const users_controllers_1 = require("../controllers/users.controllers");
const router = (0, express_1.Router)();
exports.router = router;
const checkJWT_1 = require("../middelwares/auth/checkJWT");
const TokenServiceImpl_1 = require("../../infrastructure/services/TokenServiceImpl");
const tokenService = new TokenServiceImpl_1.TokenService();
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crea un usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDTO'
 *     responses:
 *       200:
 *         description: Usuario creado
 */
router.post("/", users_controllers_1.createUserController);
router.put("/:user_id", checkJWT_1.checkJWT, users_controllers_1.updateUserController);
router.delete("/:user_id", checkJWT_1.checkJWT, users_controllers_1.deleteUserController);
router.get("/", checkJWT_1.checkJWT, users_controllers_1.getUsersController);
router.get("/:user_id", checkJWT_1.checkJWT, users_controllers_1.getUserController);
