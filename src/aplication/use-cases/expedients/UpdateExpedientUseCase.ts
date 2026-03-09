import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { IExpedientRepository } from "../../../domain/repositories/IExpedientsRepository";
import { UpdateRecordDTO } from "../../dtos/expedients/UpdateExpedientDTO";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class UpdateExpedientUseCase {
  private expedientRepository: IExpedientRepository;

  constructor(expedientRepository: IExpedientRepository) {
    this.expedientRepository = expedientRepository;
  }

  async execute(user: UpdateRecordDTO, expedient_id: number, currentUserId: number): Promise<UpdateRecordDTO | IPrismaError> {
    const existing = await this.expedientRepository.getExpedient(expedient_id);
    if (!existing || (typeof existing === "object" && "code" in existing)) return this.expedientRepository.updateRecord(user, expedient_id);
    const withPatient = existing as typeof existing & { patient?: { user_id: number } };
    if (withPatient.patient?.user_id !== currentUserId) throw new ForbiddenError();
    return this.expedientRepository.updateRecord(user, expedient_id);
  }
}
