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
exports.getExpedinetController = exports.getExpedientsController = exports.deleteExpedientController = exports.updateExpedientController = exports.createExpedientController = void 0;
const response_helper_1 = require("../../shared/helpers/response.helper");
const CreateExpedientUseCase_1 = require("../../aplication/use-cases/expedients/CreateExpedientUseCase");
const ExpedientsRepositoryImplementation_1 = require("../../infrastructure/repositories/ExpedientsRepositoryImplementation");
const UpdateExpedientUseCase_1 = require("../../aplication/use-cases/expedients/UpdateExpedientUseCase");
const DeleteExpedientUseCase_1 = require("../../aplication/use-cases/expedients/DeleteExpedientUseCase");
const GetExpedientUseCase_1 = require("../../aplication/use-cases/expedients/GetExpedientUseCase");
const GetExpedientsUseCase_1 = require("../../aplication/use-cases/expedients/GetExpedientsUseCase");
const expedientsRepository = new ExpedientsRepositoryImplementation_1.ExpedientRepositoryImpl();
const createExpedientUseCase = new CreateExpedientUseCase_1.CreateExpedientUseCase(expedientsRepository);
const updateExpedientUseCase = new UpdateExpedientUseCase_1.UpdateExpedientUseCase(expedientsRepository);
const deleteExpedientUseCase = new DeleteExpedientUseCase_1.DeleteExpedientUseCase(expedientsRepository);
const getExpedientsUseCase = new GetExpedientsUseCase_1.GetExpedientsUseCase(expedientsRepository);
const getExpedientUseCase = new GetExpedientUseCase_1.GetExpedientUseCase(expedientsRepository);
/*

const getUserUseCase = new GetUserUseCase(userRepository);
*/
const createExpedientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newExpedient = yield createExpedientUseCase.execute(req.body);
        if (newExpedient.code) {
            const error = (0, response_helper_1.errorResponse)("No pudo ser creado el expediente", 500, newExpedient);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(newExpedient, "Expediente creado con éxito");
        res.status(success.status_code).json(success);
        return;
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al intentar crear el expediente", 500);
        res.status(error.status_code).json(error);
    }
});
exports.createExpedientController = createExpedientController;
const updateExpedientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { expedient_id } = req.params;
        console.log("Expedient ID:", expedient_id);
        const expedientUpdated = yield updateExpedientUseCase.execute(req.body, parseInt(expedient_id));
        if (expedientUpdated.code) {
            const error = (0, response_helper_1.errorResponse)("No pudo ser actualizado el expediente", 500, expedientUpdated);
            res.status(error.status_code).json(error);
        }
        const success = (0, response_helper_1.successResponse)(expedientUpdated, "Expedient updated successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to update the expedient", 500);
        res.status(error.status_code).json(error);
    }
});
exports.updateExpedientController = updateExpedientController;
const deleteExpedientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { expedient_id } = req.params;
        const expedientDeleted = yield deleteExpedientUseCase.execute(expedient_id);
        if (expedientDeleted.code) {
            const error = (0, response_helper_1.errorResponse)("No pudo ser eliminado el expediente", 500, expedientDeleted);
            res.status(error.status_code).json(error);
        }
        const success = (0, response_helper_1.successResponse)(expedientDeleted, "Expedient deleted successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to delete the expedient", 500);
        res.status(error.status_code).json(error);
    }
});
exports.deleteExpedientController = deleteExpedientController;
const getExpedientsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expedientsGeted = yield getExpedientsUseCase.execute();
        if (expedientsGeted.code) {
            const error = (0, response_helper_1.errorResponse)("No se pudieron obtener los expedientes", 500, expedientsGeted);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(expedientsGeted, "Expedients geted successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to get the expedients", 500);
        res.status(error.status_code).json(error);
    }
});
exports.getExpedientsController = getExpedientsController;
const getExpedinetController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { expedient_id } = req.params;
        console.log("Expedient ID:", expedient_id);
        const expedientGeted = yield getExpedientUseCase.execute(parseInt(expedient_id));
        if (!expedientGeted) {
            const error = (0, response_helper_1.errorResponse)("It was not possible to find the expedient.", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(expedientGeted, "Expedient geted successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to get the expedient", 500);
        res.status(error.status_code).json(error);
    }
});
exports.getExpedinetController = getExpedinetController;
