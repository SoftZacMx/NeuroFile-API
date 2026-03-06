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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientSummaryRepositoryImpl = void 0;
const prisma_client_1 = __importDefault(require("../database/prisma/prisma.client"));
const IPrismaErrorsMapers_1 = require("../../domain/errors/IPrismaErrorsMapers");
class PatientSummaryRepositoryImpl {
    getSummary(patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const [lastAppointment, last4ClinicalNotes] = yield Promise.all([
                    prisma_client_1.default.appointment.findFirst({
                        where: { patientId },
                        orderBy: { date: "desc" },
                    }),
                    prisma_client_1.default.clinicalNote.findMany({
                        where: { record: { patient_id: patientId } },
                        orderBy: { date: "desc" },
                        take: 4,
                    }),
                ]);
                const last4 = last4ClinicalNotes.map((n) => ({
                    id: n.id,
                    date: n.date,
                    note: n.note,
                    recordId: n.recordId,
                }));
                const lastNote = (_a = last4[0]) !== null && _a !== void 0 ? _a : null;
                const summary = {
                    lastAppointment: lastAppointment
                        ? {
                            id: lastAppointment.id,
                            date: lastAppointment.date,
                            status: lastAppointment.status,
                            attended: lastAppointment.attended,
                            patientId: lastAppointment.patientId,
                        }
                        : null,
                    lastNote,
                    last4ClinicalNotes: last4,
                };
                return summary;
            }
            catch (error) {
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
}
exports.PatientSummaryRepositoryImpl = PatientSummaryRepositoryImpl;
