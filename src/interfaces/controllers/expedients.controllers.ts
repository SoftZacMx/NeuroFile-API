import { Request, Response } from "express";
import { RequestWithUser } from "../../shared/types/RequestWithUser";
import {
  successResponse,
  errorResponse,
} from "../../shared/helpers/response.helper";
import { CreateExpedientUseCase } from "../../aplication/use-cases/expedients/CreateExpedientUseCase";
import { ExpedientRepositoryImpl } from "../../infrastructure/repositories/ExpedientsRepositoryImplementation";
import { UpdateExpedientUseCase } from "../../aplication/use-cases/expedients/UpdateExpedientUseCase";
import { DeleteExpedientUseCase } from "../../aplication/use-cases/expedients/DeleteExpedientUseCase";
import { GetExpedientUseCase } from "../../aplication/use-cases/expedients/GetExpedientUseCase";
import { GetExpedientsUseCase } from "../../aplication/use-cases/expedients/GetExpedientsUseCase";
import { IPrismaError } from "../../domain/errors/IPrismaErrors";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";

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
        "No pudo ser creado el expediente",
        500,
        newExpedient
      );
      res.status(error.status_code).json(error);
      return
    }

    const success = successResponse(
      newExpedient,
      "Expediente creado con éxito"
    );
    res.status(success.status_code).json(success);
    return
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al intentar crear el expediente", 500);
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
        "No pudo ser actualizado el expediente",
        500,
        expedientUpdated
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      expedientUpdated,
      "Expediente actualizado correctamente"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ result: false, message: err.message });
      return;
    }
    console.error(err);
    const error = errorResponse("Error al actualizar el expediente", 500);
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
        "No pudo ser eliminado el expediente",
        500,
        expedientDeleted
      );
      res.status(error.status_code).json(error);
      return;
    }
    const success = successResponse(
      expedientDeleted,
      "Expediente eliminado correctamente"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ result: false, message: err.message });
      return;
    }
    console.error(err);
    const error = errorResponse("Error al eliminar el expediente", 500);
    res.status(error.status_code).json(error);
  }
};

export const getExpedientsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const expedientsGeted = await getExpedientsUseCase.execute();

    if ((expedientsGeted as IPrismaError).code) {
      const error = errorResponse(
        "No se pudieron obtener los expedientes",
        500,
        expedientsGeted
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      expedientsGeted,
      "Expedientes obtenidos correctamente"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al obtener los expedientes", 500);
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
        "No fue posible encontrar el expediente.",
        404
      );
      res.status(error.status_code).json(error);
      return;
    }

    const success = successResponse(
      expedientGeted,
      "Expediente obtenido correctamente"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ result: false, message: err.message });
      return;
    }
    console.error(err);
    const error = errorResponse("Error al obtener el expediente", 500);
    res.status(error.status_code).json(error);
  }
};
