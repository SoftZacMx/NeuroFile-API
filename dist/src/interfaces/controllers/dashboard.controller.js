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
exports.getDashboardStatsController = void 0;
const response_helper_1 = require("../../shared/helpers/response.helper");
const GetDashboardStatsUseCase_1 = require("../../aplication/use-cases/dashboard/GetDashboardStatsUseCase");
const DashboardStatsRepositoryImpl_1 = require("../../infrastructure/repositories/DashboardStatsRepositoryImpl");
const statsRepository = new DashboardStatsRepositoryImpl_1.DashboardStatsRepositoryImpl();
const getDashboardStatsUseCase = new GetDashboardStatsUseCase_1.GetDashboardStatsUseCase(statsRepository);
function isPrismaError(x) {
    return typeof x === "object" && x !== null && "code" in x;
}
const getDashboardStatsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.sub)) {
            const error = (0, response_helper_1.errorResponse)("No autorizado.", 401);
            res.status(error.status_code).json(error);
            return;
        }
        const userId = parseInt(req.user.sub, 10);
        const stats = yield getDashboardStatsUseCase.execute(userId);
        if (isPrismaError(stats)) {
            const error = (0, response_helper_1.errorResponse)("Error al obtener las estadísticas del dashboard.", 500);
            res.status(error.status_code).json(error);
            return;
        }
        const success = (0, response_helper_1.successResponse)(stats, "Estadísticas del dashboard");
        res.status(success.status_code).json(success);
    }
    catch (err) {
        console.error(err);
        const error = (0, response_helper_1.errorResponse)("Error al obtener las estadísticas del dashboard", 500);
        res.status(error.status_code).json(error);
    }
});
exports.getDashboardStatsController = getDashboardStatsController;
