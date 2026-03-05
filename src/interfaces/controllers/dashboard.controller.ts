import { Response } from "express";
import {
  successResponse,
  errorResponse,
} from "../../shared/helpers/response.helper";
import { GetDashboardStatsUseCase } from "../../aplication/use-cases/dashboard/GetDashboardStatsUseCase";
import { DashboardStatsRepositoryImpl } from "../../infrastructure/repositories/DashboardStatsRepositoryImpl";
import { RequestWithUser } from "../../shared/types/RequestWithUser";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";

const statsRepository = new DashboardStatsRepositoryImpl();
const getDashboardStatsUseCase = new GetDashboardStatsUseCase(statsRepository);

function isPrismaError(x: unknown): x is IPrismaError {
  return typeof x === "object" && x !== null && "code" in x;
}

export const getDashboardStatsController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.sub) {
      const error = errorResponse("No autorizado.", 401);
      res.status(error.status_code).json(error);
      return;
    }
    const userId = parseInt(req.user.sub, 10);
    const stats = await getDashboardStatsUseCase.execute(userId);

    if (isPrismaError(stats)) {
      const error = errorResponse("Error al obtener las estadísticas del dashboard.", 500);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(stats, "Estadísticas del dashboard");
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al obtener las estadísticas del dashboard", 500);
    res.status(error.status_code).json(error);
  }
};
