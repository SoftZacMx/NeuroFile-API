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
exports.deletePatientController = exports.getPatientSummaryController = exports.getPatientController = exports.getPatientsController = exports.updatePatientController = exports.createPatientController = void 0;
const response_helper_1 = require("../../shared/helpers/response.helper");
const CreatePatientUseCase_1 = require("../../aplication/use-cases/Patients/CreatePatientUseCase");
const PatientsRepositoryImplementation_1 = require("../../infrastructure/repositories/PatientsRepositoryImplementation");
const UpdatePatientUseCase_1 = require("../../aplication/use-cases/Patients/UpdatePatientUseCase");
const GetPatientsUseCase_1 = require("../../aplication/use-cases/Patients/GetPatientsUseCase");
const DeletePatientUseCase_1 = require("../../aplication/use-cases/Patients/DeletePatientUseCase");
const GetPatientUseCase_1 = require("../../aplication/use-cases/Patients/GetPatientUseCase");
const GetPatientSummaryUseCase_1 = require("../../aplication/use-cases/Patients/GetPatientSummaryUseCase");
const PatientSummaryRepositoryImpl_1 = require("../../infrastructure/repositories/PatientSummaryRepositoryImpl");
const patientRepository = new PatientsRepositoryImplementation_1.PatientRepositoryImplementation();
const summaryRepository = new PatientSummaryRepositoryImpl_1.PatientSummaryRepositoryImpl();
const createUserUseCase = new CreatePatientUseCase_1.CreatePatientUseCase(patientRepository);
const updatePatientUseCase = new UpdatePatientUseCase_1.UpdatePatientUseCase(patientRepository);
const getPatientsUseCase = new GetPatientsUseCase_1.GetPatientsUseCase(patientRepository);
const deletePatientUseCase = new DeletePatientUseCase_1.DeletePatientUseCase(patientRepository);
const getPatientUseCase = new GetPatientUseCase_1.GetPatientUseCase(patientRepository);
const getPatientSummaryUseCase = new GetPatientSummaryUseCase_1.GetPatientSummaryUseCase(summaryRepository);
function isPrismaError(x) {
    return typeof x === "object" && x !== null && "code" in x;
}
function canModifyPatient(patientUserId, req) {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.sub))
        return false;
    if (req.user.role === "admin")
        return true;
    return patientUserId === parseInt(req.user.sub, 10);
}
const createPatientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let newPatient = yield createUserUseCase.execute(req.body);
        if (newPatient == null) {
            const error = (0, response_helper_1.errorResponse)("No pudo ser creado el paciente", 500);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(newPatient, "Paciente creado con éxito");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al intentar crear el paciente", 500);
        res.status(error.status_code).json(error);
    }
});
exports.createPatientController = createPatientController;
const updatePatientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patient_id = req.params.user_id;
        const existing = yield getPatientUseCase.execute(patient_id);
        if (!existing || isPrismaError(existing)) {
            const error = (0, response_helper_1.errorResponse)("Paciente no encontrado.", 404);
            res.status(error.status_code).json(error);
            return;
        }
        if (!canModifyPatient(existing.user_id, req)) {
            const error = (0, response_helper_1.errorResponse)("No tiene permiso para editar este paciente.", 403);
            res.status(error.status_code).json(error);
            return;
        }
        const userUpdated = yield updatePatientUseCase.execute(req.body, patient_id);
        if (!userUpdated || isPrismaError(userUpdated)) {
            const error = (0, response_helper_1.errorResponse)("It was not possible to update the patient.", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(userUpdated, "Patient updated successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to update the patient", 500);
        res.status(error.status_code).json(error);
    }
});
exports.updatePatientController = updatePatientController;
const getPatientsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.sub)) {
            const error = (0, response_helper_1.errorResponse)("No autorizado para listar pacientes.", 401);
            res.status(error.status_code).json(error);
            return;
        }
        const loggedUserId = parseInt(req.user.sub, 10);
        const isAdmin = req.user.role === "admin";
        const filterUserId = isAdmin ? null : loggedUserId;
        const patientsGated = yield getPatientsUseCase.execute(filterUserId);
        if (!patientsGated) {
            const error = (0, response_helper_1.errorResponse)("It was not possible to get the patients.", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(patientsGated, "Patients geted successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to get the patients", 500);
        res.status(error.status_code).json(error);
    }
});
exports.getPatientsController = getPatientsController;
const getPatientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patient_id = req.params.user_id;
        const patient = yield getPatientUseCase.execute(patient_id);
        if (!patient || isPrismaError(patient)) {
            const error = (0, response_helper_1.errorResponse)("Paciente no encontrado.", 404);
            res.status(error.status_code).json(error);
            return;
        }
        if (!canModifyPatient(patient.user_id, req)) {
            const error = (0, response_helper_1.errorResponse)("No tiene permiso para ver este paciente.", 403);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(patient, "Paciente encontrado");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al obtener el paciente", 500);
        res.status(error.status_code).json(error);
    }
});
exports.getPatientController = getPatientController;
const getPatientSummaryController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patient_id = req.params.user_id;
        const patient = yield getPatientUseCase.execute(patient_id);
        if (!patient || isPrismaError(patient)) {
            const error = (0, response_helper_1.errorResponse)("Paciente no encontrado.", 404);
            res.status(error.status_code).json(error);
            return;
        }
        if (!canModifyPatient(patient.user_id, req)) {
            const error = (0, response_helper_1.errorResponse)("No tiene permiso para ver el resumen de este paciente.", 403);
            res.status(error.status_code).json(error);
            return;
        }
        const summary = yield getPatientSummaryUseCase.execute(parseInt(patient_id, 10));
        if (isPrismaError(summary)) {
            const error = (0, response_helper_1.errorResponse)("Error al obtener el resumen.", 500);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(summary, "Resumen del paciente");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al obtener el resumen del paciente", 500);
        res.status(error.status_code).json(error);
    }
});
exports.getPatientSummaryController = getPatientSummaryController;
const deletePatientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patient_id = req.params.user_id;
        const existing = yield getPatientUseCase.execute(patient_id);
        if (!existing || isPrismaError(existing)) {
            const error = (0, response_helper_1.errorResponse)("Paciente no encontrado.", 404);
            res.status(error.status_code).json(error);
            return;
        }
        if (!canModifyPatient(existing.user_id, req)) {
            const error = (0, response_helper_1.errorResponse)("No tiene permiso para eliminar este paciente.", 403);
            res.status(error.status_code).json(error);
            return;
        }
        const patientDelete = yield deletePatientUseCase.execute(patient_id);
        if (!patientDelete || isPrismaError(patientDelete)) {
            const error = (0, response_helper_1.errorResponse)("It was not possible to delete the patient.", 400);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(patientDelete, "Patient deleted successfuly");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error trying to delete the patient", 500);
        res.status(error.status_code).json(error);
    }
});
exports.deletePatientController = deletePatientController;
/*




export const getUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const userGeted = await getUserUseCase.execute(user_id);

    if (!userGeted) {
      const error = errorResponse("It was not possible to find the user.", 400);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(userGeted, "Users geted successfuly");
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error trying to get the user", 500);
    res.status(error.status_code).json(error);
  }
};
*/
