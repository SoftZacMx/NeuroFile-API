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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientRepositoryImplementation = void 0;
const prisma_client_1 = __importDefault(require("../database/prisma/prisma.client"));
const IPrismaErrorsMapers_1 = require("../../domain/errors/IPrismaErrorsMapers");
class PatientRepositoryImplementation {
    createPatient(patient) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newPatient = yield prisma_client_1.default.patient.create({ data: patient });
                return newPatient;
            }
            catch (error) {
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
    updatePatient(patient, patient_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedPatient = yield prisma_client_1.default.patient.update({
                    where: { id: parseInt(patient_id) },
                    data: patient,
                });
                return updatedPatient;
            }
            catch (error) {
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
    getPatients(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const patients = yield prisma_client_1.default.patient.findMany({
                    where: userId === null ? undefined : { user_id: userId },
                    include: {
                        appointments: {
                            orderBy: { date: "desc" },
                            take: 1,
                        },
                    },
                });
                return patients.map((p) => {
                    const { appointments } = p, patient = __rest(p, ["appointments"]);
                    const last = appointments[0];
                    const last_appointment = last
                        ? {
                            id: last.id,
                            date: last.date,
                            status: last.status,
                            attended: last.attended,
                            patientId: last.patientId,
                        }
                        : null;
                    return Object.assign(Object.assign({}, patient), { last_appointment });
                });
            }
            catch (error) {
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
    deletePatient(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedPatient = yield prisma_client_1.default.patient.delete({
                    where: { id: parseInt(user_id) },
                });
                return deletedPatient;
            }
            catch (error) {
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
    getPatient(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return prisma_client_1.default.patient.findFirst({ where: { id: parseInt(id) } });
            }
            catch (error) {
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
}
exports.PatientRepositoryImplementation = PatientRepositoryImplementation;
