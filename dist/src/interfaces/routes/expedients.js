"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.router = router;
const checkJWT_1 = require("../middelwares/auth/checkJWT");
const expedients_controllers_1 = require("../controllers/expedients.controllers");
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
router.put("/:expedient_id", checkJWT_1.checkJWT, expedients_controllers_1.updateExpedientController);
router.delete("/:expedient_id", checkJWT_1.checkJWT, expedients_controllers_1.deleteExpedientController);
router.get("/:expedient_id", checkJWT_1.checkJWT, expedients_controllers_1.getExpedinetController);
router.post("/", checkJWT_1.checkJWT, expedients_controllers_1.createExpedientController);
router.get("/", checkJWT_1.checkJWT, expedients_controllers_1.getExpedientsController);
