import { CreateRecordDTO } from "../../dtos/expedients/CreateExpedientDTO";
import { IExpedientRepository } from "../../../domain/repositories/IExpedientsRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class DeleteExpedientUseCase {
  private expedientRepository: IExpedientRepository;

  constructor(expedientRepository: IExpedientRepository) {
    this.expedientRepository = expedientRepository;
  }

  async execute(expedient_id: string, currentUserId: number): Promise<CreateRecordDTO | IPrismaError> {
    const id = parseInt(expedient_id, 10);
    if (Number.isNaN(id)) return this.expedientRepository.deleteRecord(expedient_id);
    const existing = await this.expedientRepository.getExpedient(id);
    if (!existing || (typeof existing === "object" && "code" in existing)) return this.expedientRepository.deleteRecord(expedient_id);
    const withPatient = existing as typeof existing & { patient?: { user_id: number } };
    if (withPatient.patient?.user_id !== currentUserId) throw new ForbiddenError();
    return this.expedientRepository.deleteRecord(expedient_id);
  }
}
