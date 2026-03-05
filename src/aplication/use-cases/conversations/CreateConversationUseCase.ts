import { IConversationRepository } from "../../../domain/repositories/IConversationRepository";
import { IExpedientRepository } from "../../../domain/repositories/IExpedientsRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";

export type CreateConversationResult =
  | { conversationId: number; startedAt: Date }
  | { error: "RECORD_NOT_FOUND" | "FORBIDDEN"; statusCode: number };

/**
 * Crea una conversación para un expediente (record). Valida que el record exista y que el usuario tenga permiso (expediente del paciente del usuario).
 */
export class CreateConversationUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly expedientRepository: IExpedientRepository
  ) {}

  async execute(
    recordId: number,
    userId: number
  ): Promise<CreateConversationResult> {
    const record = await this.expedientRepository.getExpedient(recordId);

    if (!record || (record as IPrismaError).code) {
      return { error: "RECORD_NOT_FOUND", statusCode: 404 };
    }

    const recordWithPatient = record as { patient?: { user_id: number } };
    if (recordWithPatient.patient?.user_id !== userId) {
      return { error: "FORBIDDEN", statusCode: 403 };
    }

    const conversation = await this.conversationRepository.create({
      record_id: recordId,
      user_id: userId,
    });

    return {
      conversationId: conversation.id,
      startedAt: conversation.started_at,
    };
  }
}
