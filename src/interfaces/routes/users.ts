import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  getUserController,
  getUsersController,
  updateUserController,
} from "../controllers/users.controllers";
import { checkJWT } from "../middelwares/auth/checkJWT";
import { asyncHandler } from "../../shared/middelwares/asyncHandler";

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
router.post("/", asyncHandler(createUserController));
router.put("/:user_id", checkJWT, asyncHandler(updateUserController));
router.delete("/:user_id", checkJWT, asyncHandler(deleteUserController));
router.get("/", checkJWT, asyncHandler(getUsersController));
router.get("/:user_id", checkJWT, asyncHandler(getUserController));




export {router};