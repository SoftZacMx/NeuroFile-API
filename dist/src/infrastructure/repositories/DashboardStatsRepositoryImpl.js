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
exports.DashboardStatsRepositoryImpl = void 0;
const prisma_client_1 = __importDefault(require("../database/prisma/prisma.client"));
const IPrismaErrorsMapers_1 = require("../../domain/errors/IPrismaErrorsMapers");
function getTodayStartEnd() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start, end };
}
function getNextDayStartEnd() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59, 999);
    return { start, end };
}
class DashboardStatsRepositoryImpl {
    getStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { start: todayStart, end: todayEnd } = getTodayStartEnd();
                const { start: nextDayStart, end: nextDayEnd } = getNextDayStartEnd();
                const [activePatients, appointmentsToday, appointmentsNextDay] = yield Promise.all([
                    prisma_client_1.default.patient.count({
                        where: { user_id: userId, is_active: true },
                    }),
                    prisma_client_1.default.appointment.count({
                        where: {
                            patient: { user_id: userId },
                            date: { gte: todayStart, lte: todayEnd },
                        },
                    }),
                    prisma_client_1.default.appointment.count({
                        where: {
                            patient: { user_id: userId },
                            date: { gte: nextDayStart, lte: nextDayEnd },
                        },
                    }),
                ]);
                return {
                    activePatients,
                    appointmentsToday,
                    appointmentsNextDay,
                };
            }
            catch (error) {
                return (0, IPrismaErrorsMapers_1.mapPrismaError)(error);
            }
        });
    }
}
exports.DashboardStatsRepositoryImpl = DashboardStatsRepositoryImpl;
