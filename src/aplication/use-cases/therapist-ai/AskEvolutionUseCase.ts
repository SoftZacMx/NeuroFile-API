import type { IExpedientRepository } from "../../../domain/repositories/IExpedientsRepository";
import type { TherapistContextService } from "../../services/TherapistContextService";
import type { IOpenAIChatService } from "../../../domain/services/IOpenAIChatService";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export interface AskEvolutionInput {
  recordId?: number;
  patientId?: number;
  months?: number;
}

/**
 * Obtiene contexto de evolución (notas + sesiones), lo envía a OpenAI y devuelve un resumen.
 */
export class AskEvolutionUseCase {
  constructor(
    private expedientRepository: IExpedientRepository,
    private contextService: TherapistContextService,
    private openAIChat: IOpenAIChatService
  ) {}

  async execute(
    input: AskEvolutionInput,
    currentUserId: number
  ): Promise<{ answer: string }> {
    let recordId = input.recordId;
    if (recordId == null && input.patientId != null) {
      recordId = (await this.contextService.getRecordIdByPatientId(input.patientId)) ?? undefined;
    }
    if (recordId == null) {
      throw new Error("Se debe indicar recordId o patientId.");
    }

    const expedient = await this.expedientRepository.getExpedient(recordId);
    if (!expedient || (typeof expedient === "object" && "code" in expedient)) {
      throw new ForbiddenError();
    }
    const withPatient = expedient as typeof expedient & { patient?: { user_id: number } };
    if (withPatient.patient?.user_id !== currentUserId) {
      throw new ForbiddenError();
    }

    const months = input.months ?? 6;
    const context = await this.contextService.getEvolutionContext(recordId, months);
    const systemMessage =
      "Eres un asistente para terapeutas. Te proporciono notas clínicas y resúmenes de sesiones de un paciente en un periodo. Sintetiza la evolución del paciente de forma clara y útil para el profesional.";
    const userMessage = `Contexto (últimos ${months} meses):\n${context}\n\nResume la evolución de este paciente en ese periodo.`;

    const answer = await this.openAIChat.chat(systemMessage, userMessage);
    return { answer };
  }
}
