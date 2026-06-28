import { Response } from "express";
import {
  successResponse,
  errorResponse,
} from "../../shared/helpers/response.helper";
import { Messages, Codes } from "../../shared/constants/messages";
import { GetDashboardStatsUseCase } from "../../aplication/use-cases/dashboard/GetDashboardStatsUseCase";
import {
  GetDashboardDayAppointmentsUseCase,
} from "../../aplication/use-cases/dashboard/GetDashboardDayAppointmentsUseCase";
import type { DashboardDayScope } from "../../aplication/dtos/dashboard/DashboardAppointmentDTO";
import { DashboardStatsRepositoryImpl } from "../../infrastructure/repositories/DashboardStatsRepositoryImpl";
import { RequestWithUser } from "../../shared/types/RequestWithUser";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";

const statsRepository = new DashboardStatsRepositoryImpl();
const getDashboardStatsUseCase = new GetDashboardStatsUseCase(statsRepository);
const getDashboardDayAppointmentsUseCase = new GetDashboardDayAppointmentsUseCase(
  statsRepository
);

function isPrismaError(x: unknown): x is IPrismaError {
  return typeof x === "object" && x !== null && "code" in x;
}

function parseUserId(req: RequestWithUser, res: Response): number | null {
  if (!req.user?.sub) {
    const error = errorResponse(Messages.dashboard.unauthorized, 401, undefined, Codes.UNAUTHORIZED);
    res.status(error.status_code).json(error);
    return null;
  }
  const userId = parseInt(req.user.sub, 10);
  if (Number.isNaN(userId)) {
    const error = errorResponse(Messages.dashboard.unauthorized, 401, undefined, Codes.UNAUTHORIZED);
    res.status(error.status_code).json(error);
    return null;
  }
  return userId;
}

export const getDashboardStatsController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const userId = parseUserId(req, res);
    if (userId == null) return;

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

async function getDashboardAppointmentsController(
  req: RequestWithUser,
  res: Response,
  day: DashboardDayScope
): Promise<void> {
  try {
    const userId = parseUserId(req, res);
    if (userId == null) return;

    const appointments = await getDashboardDayAppointmentsUseCase.execute(userId, day);

    if (isPrismaError(appointments)) {
      const error = errorResponse(
        Messages.dashboard.appointmentsListError,
        500,
        undefined,
        Codes.LIST_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(appointments, Messages.dashboard.appointmentsListSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(
      Messages.dashboard.appointmentsListFail,
      500,
      undefined,
      Codes.LIST_ERROR
    );
    res.status(error.status_code).json(error);
  }
}

export const getDashboardTodayAppointmentsController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => getDashboardAppointmentsController(req, res, "today");

export const getDashboardTomorrowAppointmentsController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => getDashboardAppointmentsController(req, res, "tomorrow");
