import { Router } from "express";
const router = Router();
import { checkJWT } from "../middelwares/auth/checkJWT";
import { createExpedientController, deleteExpedientController, getExpedientsController, updateExpedientController, getExpedinetController } from "../controllers/expedients.controllers";










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


router.put("/:expedient_id",checkJWT,updateExpedientController);
router.delete("/:expedient_id",checkJWT,deleteExpedientController);
router.get("/:expedient_id",checkJWT,getExpedinetController);
router.post("/",checkJWT,createExpedientController);
router.get("/",checkJWT,getExpedientsController);


export {router};