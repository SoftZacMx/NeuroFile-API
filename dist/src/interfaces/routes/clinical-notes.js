"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.router = router;
const checkJWT_1 = require("../middelwares/auth/checkJWT");
const clinical_notes_controller_1 = require("../controllers/clinical-notes.controller");
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
router.put("/:note_id", checkJWT_1.checkJWT, clinical_notes_controller_1.updateClinicalNoteController);
router.delete("/:note_id", checkJWT_1.checkJWT, clinical_notes_controller_1.deleteClinicalNoteController);
router.get("/", checkJWT_1.checkJWT, clinical_notes_controller_1.getClinicalNotesController);
router.get("/:note_id", checkJWT_1.checkJWT, clinical_notes_controller_1.getClinicalNoteController);
router.post("/", checkJWT_1.checkJWT, clinical_notes_controller_1.createClinicalNoteController);
