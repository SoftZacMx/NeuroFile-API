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
exports.getAppointmentController = exports.getAppointmentsController = exports.deleteAppointmentController = exports.updateAppointmentController = exports.createAppointmentController = void 0;
const CreateAppointmentUseCase_1 = require("../../aplication/use-cases/appointments/CreateAppointmentUseCase");
const UpdateApoitmentUseCase_1 = require("../../aplication/use-cases/appointments/UpdateApoitmentUseCase");
const DeleteAppointmentUseCase_1 = require("../../aplication/use-cases/appointments/DeleteAppointmentUseCase");
const GetAppointmentUseCase_1 = require("../../aplication/use-cases/appointments/GetAppointmentUseCase");
const GetAppointmentsUseCase_1 = require("../../aplication/use-cases/appointments/GetAppointmentsUseCase");
const AppointmentsRepositoryImple_1 = require("../../infrastructure/repositories/AppointmentsRepositoryImple");
const response_helper_1 = require("../../shared/helpers/response.helper");
const repo = new AppointmentsRepositoryImple_1.AppointmentRepositoryImpl();
const createUC = new CreateAppointmentUseCase_1.CreateAppointmentUseCase(repo);
const updateUC = new UpdateApoitmentUseCase_1.UpdateAppointmentUseCase(repo);
const deleteUC = new DeleteAppointmentUseCase_1.DeleteAppointmentUseCase(repo);
const getOneUC = new GetAppointmentUseCase_1.GetAppointmentUseCase(repo);
const getAllUC = new GetAppointmentsUseCase_1.GetAppointmentsUseCase(repo);
const createAppointmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newAppointment = yield createUC.execute(req.body);
        if (newAppointment.code) {
            const error = (0, response_helper_1.errorResponse)("No pudo ser actualizda la nota", 500, newAppointment);
            res.status(error.status_code).json(error);
        }
        const success = (0, response_helper_1.successResponse)(newAppointment, "Appointmente creado con éxito");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al intentar crear el Appointmente", 500);
        res.status(error.status_code).json(error);
    }
});
exports.createAppointmentController = createAppointmentController;
const updateAppointmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { appointment_id } = req.params;
        console.log("Appointment ID:", appointment_id);
        const AppointmentUpdated = yield updateUC.execute(parseInt(appointment_id), req.body);
        if (AppointmentUpdated.code) {
            const error = (0, response_helper_1.errorResponse)("No pudo ser actualizda la cita", 500, AppointmentUpdated);
            res.status(error.status_code).json(error);
        }
        const success = (0, response_helper_1.successResponse)(AppointmentUpdated, "Appointment updated successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to update the Appointment", 500);
        res.status(error.status_code).json(error);
    }
});
exports.updateAppointmentController = updateAppointmentController;
const deleteAppointmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { appointment_id } = req.params;
        const AppointmentDeleted = yield deleteUC.execute(parseInt(appointment_id));
        if (AppointmentDeleted.code) {
            const error = (0, response_helper_1.errorResponse)("No pudo ser eliminat la cita", 500, AppointmentDeleted);
            res.status(error.status_code).json(error);
        }
        const success = (0, response_helper_1.successResponse)(AppointmentDeleted, "Appointment deleted successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to delete the Appointment", 500);
        res.status(error.status_code).json(error);
    }
});
exports.deleteAppointmentController = deleteAppointmentController;
const getAppointmentsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patientIdParam = req.query.patientId;
        const patientId = patientIdParam != null
            ? parseInt(String(patientIdParam), 10)
            : undefined;
        const patientIdFilter = patientId != null && !Number.isNaN(patientId) ? patientId : undefined;
        const dateFrom = typeof req.query.dateFrom === "string" && req.query.dateFrom
            ? req.query.dateFrom
            : undefined;
        const dateTo = typeof req.query.dateTo === "string" && req.query.dateTo
            ? req.query.dateTo
            : undefined;
        const AppointmentsGeted = yield getAllUC.execute(patientIdFilter, dateFrom, dateTo);
        if (AppointmentsGeted.code) {
            const error = (0, response_helper_1.errorResponse)("No se pudieron obtener las citas", 500, AppointmentsGeted);
            res.status(error.status_code).json(error);
        }
        const success = (0, response_helper_1.successResponse)(AppointmentsGeted, "Appointments geted successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to get the Appointments", 500);
        res.status(error.status_code).json(error);
    }
});
exports.getAppointmentsController = getAppointmentsController;
const getAppointmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { appointment_id } = req.params;
        console.log("Appointment ID:", appointment_id);
        const AppointmentGeted = yield getOneUC.execute(parseInt(appointment_id));
        if (AppointmentGeted.code) {
            const error = (0, response_helper_1.errorResponse)("No se pudo obtener la cita", 500, AppointmentGeted);
            res.status(error.status_code).json(error);
        }
        const success = (0, response_helper_1.successResponse)(AppointmentGeted, "Appointment geted successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to get the Appointment", 500);
        res.status(error.status_code).json(error);
    }
});
exports.getAppointmentController = getAppointmentController;
