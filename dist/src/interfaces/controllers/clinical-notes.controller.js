"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClinicalNoteController = exports.getClinicalNotesController = exports.deleteClinicalNoteController = exports.updateClinicalNoteController = exports.createClinicalNoteController = void 0;
const ClincalNotesRepository_1 = require("../../infrastructure/repositories/ClincalNotesRepository");
const CreateClinicalNoteUseCase_1 = require("../../aplication/use-cases/clinical_notes/CreateClinicalNoteUseCase");
const response_helper_1 = require("../../shared/helpers/response.helper");
const UpdateClinicalNoteUseCase_1 = require("../../aplication/use-cases/clinical_notes/UpdateClinicalNoteUseCase");
const DeleteClinicalNoteUseCase_1 = require("../../aplication/use-cases/clinical_notes/DeleteClinicalNoteUseCase");
const GetClinicalNotesUseCase_1 = require("../../aplication/use-cases/clinical_notes/GetClinicalNotesUseCase");
const GetClinicalNoteUseCase_1 = require("../../aplication/use-cases/clinical_notes/GetClinicalNoteUseCase");
const clinicalNoteRepository = new ClincalNotesRepository_1.ClinicalNoteRepositoryImpl();
const createNoteUseCase = new CreateClinicalNoteUseCase_1.CreateClinicalNoteUseCase(clinicalNoteRepository);
const updateNoteUseCase = new UpdateClinicalNoteUseCase_1.UpdateClinicalNoteUseCase(clinicalNoteRepository);
const deleteNoteUseCase = new DeleteClinicalNoteUseCase_1.RemoveClinicalNoteUseCase(clinicalNoteRepository);
const getNotesUseCase = new GetClinicalNotesUseCase_1.GetClinicalNotesUseCase(clinicalNoteRepository);
const getNoteUseCase = new GetClinicalNoteUseCase_1.GetClinicalNoteUseCase(clinicalNoteRepository);
const createClinicalNoteController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newClinicalNote = yield createNoteUseCase.execute(req.body);
        if (newClinicalNote.code) {
            const error = (0, response_helper_1.errorResponse)("No pudo ser creada la nota", 500, newClinicalNote);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(newClinicalNote, "Nota clinica creado con éxito");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al intentar crear la nota clinica", 500);
        res.status(error.status_code).json(error);
    }
});
exports.createClinicalNoteController = createClinicalNoteController;
const updateClinicalNoteController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { note_id } = req.params;
        const updatedClinicalNote = yield updateNoteUseCase.execute(req.body, parseInt(note_id));
        if (updatedClinicalNote.code) {
            const error = (0, response_helper_1.errorResponse)("No pudo ser actualizda la nota", 500, updatedClinicalNote);
            res.status(error.status_code).json(error);
        }
        const success = (0, response_helper_1.successResponse)(updatedClinicalNote, "Nota clinica actualizada con éxito");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al intentar actualizar la nota clinica", 500);
        res.status(error.status_code).json(error);
    }
});
exports.updateClinicalNoteController = updateClinicalNoteController;
const deleteClinicalNoteController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { note_id } = req.params;
        const removeClinicalNote = yield deleteNoteUseCase.execute(parseInt(note_id));
        if (removeClinicalNote.code) {
            const error = (0, response_helper_1.errorResponse)("No pudo ser eliminada la nota", 500, removeClinicalNote);
            res.status(error.status_code).json(error);
        }
        const success = (0, response_helper_1.successResponse)(removeClinicalNote, "Nota clinica eliminada con éxito");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al intentar eliminar la nota clinica", 500);
        res.status(error.status_code).json(error);
    }
});
exports.deleteClinicalNoteController = deleteClinicalNoteController;
const getClinicalNotesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const recordIdParam = (_a = req.query.record_id) !== null && _a !== void 0 ? _a : (_b = req.body) === null || _b === void 0 ? void 0 : _b.record_id;
        const recordId = recordIdParam != null ? parseInt(String(recordIdParam), 10) : NaN;
        if (Number.isNaN(recordId)) {
            const error = (0, response_helper_1.errorResponse)("record_id es requerido", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const dateFrom = typeof req.query.dateFrom === "string" && req.query.dateFrom
            ? req.query.dateFrom
            : undefined;
        const dateTo = typeof req.query.dateTo === "string" && req.query.dateTo
            ? req.query.dateTo
            : undefined;
        const clinicalNotes = yield getNotesUseCase.execute(recordId, dateFrom, dateTo);
        if (clinicalNotes.code) {
            const error = (0, response_helper_1.errorResponse)("No se pudieron obtener las notas clinicas", 500, clinicalNotes);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(clinicalNotes, "Notas clinica encontradas con éxito");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al intentar obtener las notas clinica", 500);
        res.status(error.status_code).json(error);
    }
});
exports.getClinicalNotesController = getClinicalNotesController;
const getClinicalNoteController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { note_id } = req.params;
        console.log("note_id", note_id);
        const clinicalNote = yield getNoteUseCase.execute(parseInt(note_id));
        if (clinicalNote.code) {
            const error = (0, response_helper_1.errorResponse)("No se pudo obtener las nota clinicas", 500, clinicalNote);
            res.status(error.status_code).json(error);
        }
        const success = (0, response_helper_1.successResponse)(clinicalNote, "Nota clinica encontrada con éxito");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al intentar obtener la nota clinica", 500);
        res.status(error.status_code).json(error);
    }
});
exports.getClinicalNoteController = getClinicalNoteController;
