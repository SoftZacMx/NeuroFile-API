import { Response } from "express";
import {
  successResponse,
  errorResponse,
} from "../../shared/helpers/response.helper";
import { Messages, Codes } from "../../shared/constants/messages";
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
      const error = errorResponse(Messages.dashboard.unauthorized, 401, undefined, Codes.UNAUTHORIZED);
      res.status(error.status_code).json(error);
      return;
    }
    const userId = parseInt(req.user.sub, 10);
    const stats = await getDashboardStatsUseCase.execute(userId);

    if (isPrismaError(stats)) {
      const error = errorResponse(Messages.dashboard.listError, 500, undefined, Codes.LIST_ERROR);
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(stats, Messages.dashboard.listSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(Messages.dashboard.listFail, 500, undefined, Codes.LIST_ERROR);
    res.status(error.status_code).json(error);
  }
};
