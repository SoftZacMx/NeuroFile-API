import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { IExpedientRepository } from "../../../domain/repositories/IExpedientsRepository";
import { ExpedientDTO } from "../../dtos/expedients/ExpedientDTO";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class GetExpedientUseCase {
  private expedientsRepository: IExpedientRepository;

  constructor(expedientsRepository: IExpedientRepository) {
    this.expedientsRepository = expedientsRepository;
  }

  async execute(expedient_id: number, currentUserId: number): Promise<ExpedientDTO | IPrismaError | null> {
    const expedient = await this.expedientsRepository.getExpedient(expedient_id);
    if (!expedient || (typeof expedient === "object" && "code" in expedient)) return expedient;
    const withPatient = expedient as ExpedientDTO & { patient?: { user_id: number } };
    if (withPatient.patient?.user_id !== currentUserId) throw new ForbiddenError();
    return expedient;
  }
}
