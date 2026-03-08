import { Router } from "express";
import { checkJWT } from "../middelwares/auth/checkJWT";
import { asyncHandler } from "../../shared/middelwares/asyncHandler";
import { createExpedientValidator, updateExpedientValidator } from "../middelwares/validators/expedients.validators";
import {
  createExpedientController,
  deleteExpedientController,
  getExpedientsController,
  updateExpedientController,
  getExpedinetController,
} from "../controllers/expedients.controllers";

const router = Router();










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


router.put("/:expedient_id", checkJWT, updateExpedientValidator, asyncHandler(updateExpedientController));
router.delete("/:expedient_id", checkJWT, asyncHandler(deleteExpedientController));
router.get("/:expedient_id", checkJWT, asyncHandler(getExpedinetController));
router.post("/", checkJWT, createExpedientValidator, asyncHandler(createExpedientController));
router.get("/", checkJWT, asyncHandler(getExpedientsController));


export {router};