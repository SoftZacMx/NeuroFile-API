import { Request, Response } from "express";

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
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { expedient_id } = req.params;
    console.log("Expedient ID:", expedient_id);

    const expedientUpdated = await updateExpedientUseCase.execute(
      req.body,
      parseInt(expedient_id)
    );

    if ((expedientUpdated as IPrismaError).code) {
      const error = errorResponse(
        "No pudo ser actualizado el expediente",
        500,
        expedientUpdated
      );
      res.status(error.status_code).json(error);
    }

    const success = successResponse(
      expedientUpdated,
      "Expediente actualizado correctamente"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
    console.error(err);
    const error = errorResponse("Error al actualizar el expediente", 500);
    res.status(error.status_code).json(error);
  }
};

export const deleteExpedientController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { expedient_id } = req.params;
    const expedientDeleted = await deleteExpedientUseCase.execute(expedient_id);

    if ((expedientDeleted as IPrismaError).code) {
      const error = errorResponse(
        "No pudo ser eliminado el expediente",
        500,
        expedientDeleted
      );
      res.status(error.status_code).json(error);
    }
    const success = successResponse(
      expedientDeleted,
      "Expediente eliminado correctamente"
    );
    res.status(success.status_code).json(success);
  } catch (err) {
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
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { expedient_id } = req.params;
    console.log("Expedient ID:", expedient_id);

    const expedientGeted = await getExpedientUseCase.execute(
      parseInt(expedient_id)
    );

    if (!expedientGeted) {
      const error = errorResponse(
        "No fue posible encontrar el expediente.",
        400
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
    console.error(err);
    const error = errorResponse("Error al obtener el expediente", 500);
    res.status(error.status_code).json(error);
  }
};
