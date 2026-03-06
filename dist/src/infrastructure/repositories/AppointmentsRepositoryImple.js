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
exports.AppointmentRepositoryImpl = void 0;
const prisma_client_1 = __importDefault(require("../database/prisma/prisma.client"));
const IPrismaErrorsMapers_1 = require("../../domain/errors/IPrismaErrorsMapers");
class AppointmentRepositoryImpl {
    createAppointment(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma_client_1.default.appointment.create({ data: dto });
            }
            catch (error) {
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
    updateAppointment(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma_client_1.default.appointment.update({
                    where: { id },
                    data: dto,
                });
            }
            catch (error) {
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
    deleteAppointment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma_client_1.default.appointment.delete({ where: { id } });
            }
            catch (error) {
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
    getAppointment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma_client_1.default.appointment.findUnique({ where: { id } });
            }
            catch (error) {
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
    getAppointments(patientId, dateFrom, dateTo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conditions = {};
                if (patientId != null)
                    conditions.patientId = patientId;
                if (dateFrom != null || dateTo != null) {
                    conditions.date = {};
                    if (dateFrom != null) {
                        conditions.date.gte = new Date(`${dateFrom}T00:00:00.000Z`);
                    }
                    if (dateTo != null) {
                        conditions.date.lte = new Date(`${dateTo}T23:59:59.999Z`);
                    }
                }
                return yield prisma_client_1.default.appointment.findMany({
                    where: Object.keys(conditions).length ? conditions : undefined,
                });
            }
            catch (error) {
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
}
exports.AppointmentRepositoryImpl = AppointmentRepositoryImpl;
