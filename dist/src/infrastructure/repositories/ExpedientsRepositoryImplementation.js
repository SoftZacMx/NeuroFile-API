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
exports.ExpedientRepositoryImpl = void 0;
const prisma_client_1 = __importDefault(require("../database/prisma/prisma.client"));
const IPrismaErrorsMapers_1 = require("../../domain/errors/IPrismaErrorsMapers");
class ExpedientRepositoryImpl {
    findByEmail(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_client_1.default.record.findFirst({ where: { id: parseInt(id) } });
        });
    }
    createRecord(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield prisma_client_1.default.record.create({
                data: {
                    incident_details: dto.incident_details,
                    physical_description: dto.physical_description,
                    treatment_demand: dto.treatment_demand,
                    school_area: dto.school_area,
                    work_area: dto.work_area,
                    significant_events: dto.significant_events,
                    psychosexual_history: dto.psychosexual_history,
                    therapeutic_focus: dto.therapeutic_focus,
                    therapeutic_goal: dto.therapeutic_goal,
                    therapeutic_strategy: dto.therapeutic_strategy,
                    therapeutic_forecast: dto.therapeutic_forecast,
                    family_diagram: dto.family_diagram,
                    family_relationship: dto.family_relationship,
                    family_mapping: dto.family_mapping,
                    diagnostic_impression: dto.diagnostic_impression,
                    family_hypothesis: dto.family_hypothesis,
                    mental_exam: dto.mental_exam,
                    diagnostic_notes: dto.diagnostic_notes,
                    consultation_reason: dto.consultation_reason,
                    patient: {
                        connect: { id: dto.patient_id },
                    },
                    symptoms: dto.symptoms
                        ? {
                            create: dto.symptoms.map((s) => ({
                                detail: s.detail,
                            })),
                        }
                        : undefined,
                    diagnoses: dto.diagnoses
                        ? {
                            create: dto.diagnoses.map((d) => ({
                                axis: d.axis,
                                dcm: d.dcm,
                                cie: d.cie,
                                disorder: d.disorder,
                            })),
                        }
                        : undefined,
                    modalities: dto.modalities
                        ? {
                            create: dto.modalities.map((m) => ({
                                ti: m.ti,
                                tf: m.tf,
                                tp: m.tp,
                                tg: m.tg,
                                other: m.other,
                                rationale: m.rationale,
                            })),
                        }
                        : undefined,
                },
                include: {
                    symptoms: true,
                    diagnoses: true,
                    modalities: true,
                },
            });
            return record;
        });
    }
    updateRecord(dto, id) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Actualizar campos simples del Record
            const updatedRecord = yield prisma_client_1.default.record.update({
                where: { id },
                data: {
                    incident_details: dto.incident_details,
                    physical_description: dto.physical_description,
                    treatment_demand: dto.treatment_demand,
                    school_area: dto.school_area,
                    work_area: dto.work_area,
                    significant_events: dto.significant_events,
                    psychosexual_history: dto.psychosexual_history,
                    therapeutic_focus: dto.therapeutic_focus,
                    therapeutic_goal: dto.therapeutic_goal,
                    therapeutic_strategy: dto.therapeutic_strategy,
                    therapeutic_forecast: dto.therapeutic_forecast,
                    family_diagram: dto.family_diagram,
                    family_relationship: dto.family_relationship,
                    family_mapping: dto.family_mapping,
                    diagnostic_impression: dto.diagnostic_impression,
                    family_hypothesis: dto.family_hypothesis,
                    mental_exam: dto.mental_exam,
                    diagnostic_notes: dto.diagnostic_notes,
                    consultation_reason: dto.consultation_reason,
                },
            });
            // 2. Reemplazar síntomas
            if (dto.symptoms) {
                yield prisma_client_1.default.symptom.deleteMany({ where: { recordId: id } });
                yield prisma_client_1.default.symptom.createMany({
                    data: dto.symptoms.map((s) => ({
                        detail: s.detail,
                        recordId: id,
                    })),
                    skipDuplicates: true,
                });
            }
            // 3. Reemplazar diagnósticos
            if (dto.diagnoses) {
                yield prisma_client_1.default.diagnosticImpression.deleteMany({ where: { recordId: id } });
                yield prisma_client_1.default.diagnosticImpression.createMany({
                    data: dto.diagnoses.map((d) => ({
                        axis: d.axis || null,
                        dcm: d.dcm || null,
                        cie: d.cie || null,
                        disorder: d.disorder || null,
                        recordId: id,
                    })),
                    skipDuplicates: true,
                });
            }
            // 4. Reemplazar modalidades terapéuticas
            if (dto.modalities) {
                yield prisma_client_1.default.therapeuticModality.deleteMany({ where: { recordId: id } });
                yield prisma_client_1.default.therapeuticModality.createMany({
                    data: dto.modalities.map((m) => {
                        var _a, _b, _c, _d, _e;
                        return ({
                            ti: (_a = m.ti) !== null && _a !== void 0 ? _a : false,
                            tf: (_b = m.tf) !== null && _b !== void 0 ? _b : false,
                            tp: (_c = m.tp) !== null && _c !== void 0 ? _c : false,
                            tg: (_d = m.tg) !== null && _d !== void 0 ? _d : false,
                            other: (_e = m.other) !== null && _e !== void 0 ? _e : false,
                            rationale: m.rationale || null,
                            recordId: id,
                        });
                    }),
                    skipDuplicates: true,
                });
            }
            return updatedRecord;
        });
    }
    deleteRecord(expedient_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedExpedient = yield prisma_client_1.default.record.delete({
                    where: { id: parseInt(expedient_id) },
                });
                return deletedExpedient;
            }
            catch (error) {
                console.error("Error deleting the user:", error);
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
    getExpedients() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma_client_1.default.record.findMany({
                    include: {
                        symptoms: true,
                        diagnoses: true,
                        modalities: true,
                        clinical_notes: true, // si también quieres notas clínicas
                        patient: true,
                    },
                });
            }
            catch (error) {
                console.error("Error geting the expedients:", error);
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
    getExpedient(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const expedient = yield prisma_client_1.default.record.findUnique({
                    where: { id: id },
                    include: {
                        symptoms: true,
                        diagnoses: true,
                        modalities: true,
                        patient: true,
                    }
                });
                return expedient;
            }
            catch (error) {
                console.error("Error geting the expedient:", error);
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
}
exports.ExpedientRepositoryImpl = ExpedientRepositoryImpl;
