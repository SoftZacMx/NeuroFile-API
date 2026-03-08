import { Router } from "express";
import { checkJWT } from "../middelwares/auth/checkJWT";
import { asyncHandler } from "../../shared/middelwares/asyncHandler";
import { createClinicalNoteValidator, updateClinicalNoteValidator } from "../middelwares/validators/clinical-notes.validators";
import {
  createClinicalNoteController,
  deleteClinicalNoteController,
  getClinicalNoteController,
  getClinicalNotesController,
  updateClinicalNoteController,
} from "../controllers/clinical-notes.controller";

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


router.put("/:note_id", checkJWT, updateClinicalNoteValidator, asyncHandler(updateClinicalNoteController));
router.delete("/:note_id", checkJWT, asyncHandler(deleteClinicalNoteController));
router.get("/", checkJWT, asyncHandler(getClinicalNotesController));
router.get("/:note_id", checkJWT, asyncHandler(getClinicalNoteController));
router.post("/", checkJWT, createClinicalNoteValidator, asyncHandler(createClinicalNoteController));

/*




*/

export {router};