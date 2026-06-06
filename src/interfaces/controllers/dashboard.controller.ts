import { Response } from "express";
import {
  successResponse,
  errorResponse,
} from "../../shared/helpers/response.helper";
import { Messages, Codes } from "../../shared/constants/messages";
import { GetDashboardStatsUseCase } from "../../aplication/use-cases/dashboard/GetDashboardStatsUseCase";
import { GetDashboardTodayAppointmentsUseCase } from "../../aplication/use-cases/dashboard/GetDashboardTodayAppointmentsUseCase";
import { GetDashboardTomorrowAppointmentsUseCase } from "../../aplication/use-cases/dashboard/GetDashboardTomorrowAppointmentsUseCase";
import { DashboardStatsRepositoryImpl } from "../../infrastructure/repositories/DashboardStatsRepositoryImpl";
import { DashboardScope } from "../../aplication/dtos/dashboard/DashboardScope";
import { RequestWithUser } from "../../shared/types/RequestWithUser";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";

const statsRepository = new DashboardStatsRepositoryImpl();
const getDashboardStatsUseCase = new GetDashboardStatsUseCase(statsRepository);
const getDashboardTodayAppointmentsUseCase = new GetDashboardTodayAppointmentsUseCase(
  statsRepository
);
const getDashboardTomorrowAppointmentsUseCase = new GetDashboardTomorrowAppointmentsUseCase(
  statsRepository
);

function isPrismaError(x: unknown): x is IPrismaError {
  return typeof x === "object" && x !== null && "code" in x;
}

function getDashboardScope(req: RequestWithUser): DashboardScope | null {
  if (!req.user?.sub) return null;
  return {
    userId: parseInt(req.user.sub, 10),
  };
}

export const getDashboardStatsController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const scope = getDashboardScope(req);
    if (!scope) {
      const error = errorResponse(Messages.dashboard.unauthorized, 401, undefined, Codes.UNAUTHORIZED);
      res.status(error.status_code).json(error);
      return;
    }
    const stats = await getDashboardStatsUseCase.execute(scope);

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

export const getDashboardTodayAppointmentsController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const scope = getDashboardScope(req);
    if (!scope) {
      const error = errorResponse(Messages.dashboard.unauthorized, 401, undefined, Codes.UNAUTHORIZED);
      res.status(error.status_code).json(error);
      return;
    }
    const appointments = await getDashboardTodayAppointmentsUseCase.execute(scope);

    if (isPrismaError(appointments)) {
      const error = errorResponse(
        Messages.dashboard.appointmentsTodayError,
        500,
        undefined,
        Codes.LIST_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      appointments,
      Messages.dashboard.appointmentsTodaySuccess
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(
      Messages.dashboard.appointmentsTodayFail,
      500,
      undefined,
      Codes.LIST_ERROR
    );
    res.status(error.status_code).json(error);
  }
};

export const getDashboardTomorrowAppointmentsController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const scope = getDashboardScope(req);
    if (!scope) {
      const error = errorResponse(Messages.dashboard.unauthorized, 401, undefined, Codes.UNAUTHORIZED);
      res.status(error.status_code).json(error);
      return;
    }
    const appointments = await getDashboardTomorrowAppointmentsUseCase.execute(scope);

    if (isPrismaError(appointments)) {
      const error = errorResponse(
        Messages.dashboard.appointmentsTomorrowError,
        500,
        undefined,
        Codes.LIST_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      appointments,
      Messages.dashboard.appointmentsTomorrowSuccess
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(
      Messages.dashboard.appointmentsTomorrowFail,
      500,
      undefined,
      Codes.LIST_ERROR
    );
    res.status(error.status_code).json(error);
  }
};
