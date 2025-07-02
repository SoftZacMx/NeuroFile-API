import { Router } from "express";
const router = Router();
import { checkJWT } from "../middelwares/auth/checkJWT";
import { createExpedientController, deleteExpedientController, getExpedientsController, updateExpedientController, getExpedinetController } from "../controllers/expedients.controllers";
import { createClinicalNoteController, deleteClinicalNoteController, getClinicalNoteController, getClinicalNotesController, updateClinicalNoteController } from "../controllers/clinical-notes.controller";









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


router.put("/:note_id",checkJWT,updateClinicalNoteController);
router.delete("/:note_id",checkJWT,deleteClinicalNoteController);
router.get("/",checkJWT,getClinicalNotesController);
router.get("/:note_id",checkJWT,getClinicalNoteController);
router.post("/",checkJWT,createClinicalNoteController);

/*




*/

export {router};