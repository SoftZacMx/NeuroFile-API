import { Request, Response } from "express";
import { RequestWithUser } from "../../shared/types/RequestWithUser";
import {
  successResponse,
  errorResponse,
  forbiddenResponse,
} from "../../shared/helpers/response.helper";
import { Messages, Codes } from "../../shared/constants/messages";
import { CreateExpedientUseCase } from "../../aplication/use-cases/expedients/CreateExpedientUseCase";
import { ExpedientRepositoryImpl } from "../../infrastructure/repositories/ExpedientsRepositoryImplementation";
import { UpdateExpedientUseCase } from "../../aplication/use-cases/expedients/UpdateExpedientUseCase";
import { DeleteExpedientUseCase } from "../../aplication/use-cases/expedients/DeleteExpedientUseCase";
import { GetExpedientUseCase } from "../../aplication/use-cases/expedients/GetExpedientUseCase";
import { GetExpedientsUseCase } from "../../aplication/use-cases/expedients/GetExpedientsUseCase";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";
import { ExpedientAlreadyExistsError } from "../../domain/errors/ExpedientAlreadyExistsError";

const expedientsRepository = new ExpedientRepositoryImpl();
const createExpedientUseCase = new CreateExpedientUseCase(expedientsRepository);
const updateExpedientUseCase = new UpdateExpedientUseCase(expedientsRepository);
const deleteExpedientUseCase = new DeleteExpedientUseCase(expedientsRepository);
const getExpedientsUseCase = new GetExpedientsUseCase(expedientsRepository);
const getExpedientUseCase = new GetExpedientUseCase(expedientsRepository);
/*

const getUserUseCase = new GetUserUseCase(userRepository);
*/

export const createExpedientController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newExpedient = await createExpedientUseCase.execute(req.body);

    if ((newExpedient as IPrismaError).code) {
      const error = errorResponse(
        Messages.expedient.createError,
        500,
        newExpedient,
        Codes.CREATE_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(newExpedient, Messages.expedient.createSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ExpedientAlreadyExistsError) {
      const error = errorResponse(
        err.message || Messages.expedient.alreadyExists,
        409,
        undefined,
        Codes.CONFLICT
      );
      res.status(error.status_code).json(error);
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.expedient.createFail, 500, undefined, Codes.CREATE_ERROR);
    res.status(error.status_code).json(error);
  }
};

export const updateExpedientController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { expedient_id } = req.params;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const expedientUpdated = await updateExpedientUseCase.execute(
      req.body,
      parseInt(expedient_id),
      currentUserId
    );

    if ((expedientUpdated as IPrismaError).code) {
      const error = errorResponse(
        Messages.expedient.updateError,
        500,
        expedientUpdated,
        Codes.UPDATE_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(expedientUpdated, Messages.expedient.updateSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.expedient.updateFail, 500, undefined, Codes.UPDATE_ERROR);
    res.status(error.status_code).json(error);
  }
};

export const deleteExpedientController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { expedient_id } = req.params;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const expedientDeleted = await deleteExpedientUseCase.execute(expedient_id, currentUserId);

    if ((expedientDeleted as IPrismaError).code) {
      const error = errorResponse(
        Messages.expedient.deleteError,
        500,
        expedientDeleted,
        Codes.DELETE_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }
    const success = successResponse(expedientDeleted, Messages.expedient.deleteSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.expedient.deleteFail, 500, undefined, Codes.DELETE_ERROR);
    res.status(error.status_code).json(error);
  }
};

export const getExpedientsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const patientIdParam = req.query.patientId;
    const parsedPatientId =
      patientIdParam != null
        ? parseInt(String(patientIdParam), 10)
        : undefined;
    const patientIdFilter =
      parsedPatientId != null && !Number.isNaN(parsedPatientId)
        ? parsedPatientId
        : undefined;
    const expedientsGeted = await getExpedientsUseCase.execute(patientIdFilter);

    if ((expedientsGeted as IPrismaError).code) {
      const error = errorResponse(
        Messages.expedient.listError,
        500,
        expedientsGeted,
        Codes.LIST_ERROR
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(expedientsGeted, Messages.expedient.listSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse(Messages.expedient.listFail, 500, undefined, Codes.LIST_ERROR);
    res.status(error.status_code).json(error);
  }
};

export const getExpedinetController = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { expedient_id } = req.params;
    const currentUserId = req.user?.sub != null ? parseInt(req.user.sub, 10) : 0;
    const expedientGeted = await getExpedientUseCase.execute(
      parseInt(expedient_id),
      currentUserId
    );

    if (!expedientGeted || (expedientGeted as IPrismaError).code) {
      const error = errorResponse(
        Messages.expedient.notFound,
        404,
        undefined,
        Codes.NOT_FOUND
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(expedientGeted, Messages.expedient.getSuccess);
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json(forbiddenResponse(err.message));
      return;
    }
    console.error(err);
    const error = errorResponse(Messages.expedient.getFail, 500, undefined, Codes.GET_ERROR);
    res.status(error.status_code).json(error);
  }
};
