import type { IExpedientRepository } from "../../../domain/repositories/IExpedientsRepository";
import type { TherapistContextService } from "../../services/TherapistContextService";
import type { IOpenAIChatService } from "../../../domain/services/IOpenAIChatService";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

const DEFAULT_QUESTION = "¿De qué se habló en la última sesión con este paciente? Resumelo de forma clara para el terapeuta.";

export interface AskLastSessionInput {
  recordId?: number;
  patientId?: number;
  question?: string;
}

/**
 * Obtiene contexto de la última sesión, lo envía a OpenAI y devuelve la respuesta.
 * Valida que el expediente pertenezca al usuario.
 */
export class AskLastSessionUseCase {
  constructor(
    private expedientRepository: IExpedientRepository,
    private contextService: TherapistContextService,
    private openAIChat: IOpenAIChatService
  ) {}

  async execute(
    input: AskLastSessionInput,
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

    const context = await this.contextService.getLastSessionContext(recordId);
    const systemMessage =
      "Eres un asistente para terapeutas. Te proporciono el contenido (transcripción o resumen) de la última sesión de un paciente. Responde de forma clara y útil para el profesional, sin inventar datos.";
    const userMessage = `Contexto:\n${context}\n\nPregunta del terapeuta: ${input.question?.trim() || DEFAULT_QUESTION}`;

    const answer = await this.openAIChat.chat(systemMessage, userMessage);
    return { answer };
  }
}
