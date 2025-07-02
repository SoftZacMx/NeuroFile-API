import { Router } from "express";
import { createUserController, deleteUserController, getUserController, getUsersController, updateUserController } from "../controllers/users.controllers";
const router = Router();
import { checkJWT } from "../middelwares/auth/checkJWT";
import { TokenService } from "../../infrastructure/services/TokenServiceImpl";
import { check } from "express-validator";







const tokenService = new TokenService();


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

router.post("/",createUserController);
router.put("/:user_id",checkJWT,updateUserController);
router.delete("/:user_id",checkJWT,deleteUserController);
router.get("/",checkJWT,getUsersController);
router.get("/:user_id",checkJWT,getUserController);




export {router};