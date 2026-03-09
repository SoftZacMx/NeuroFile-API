import type { IConversationRepository } from "../../../domain/repositories/IConversationRepository";
import type { IExpedientRepository } from "../../../domain/repositories/IExpedientsRepository";
import type { TherapistContextService } from "../../services/TherapistContextService";
import type { IOpenAIChatService } from "../../../domain/services/IOpenAIChatService";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export interface SuggestClinicalNoteInput {
  conversationId: number;
  section?: "evolution" | "closing" | "full";
}

/**
 * Obtiene el contexto de la conversación actual y pide a OpenAI un borrador de nota clínica.
 */
export class SuggestClinicalNoteUseCase {
  constructor(
    private conversationRepository: IConversationRepository,
    private expedientRepository: IExpedientRepository,
    private contextService: TherapistContextService,
    private openAIChat: IOpenAIChatService
  ) {}

  async execute(
    input: SuggestClinicalNoteInput,
    currentUserId: number
  ): Promise<{ suggestion: string }> {
    const conv = await this.conversationRepository.getByIdWithRecord(input.conversationId);
    if (!conv) {
      throw new Error("Conversación no encontrada.");
    }
    const patientId = conv.record.patient_id;
    const recordId = await this.expedientRepository.getRecordIdByPatientId(patientId);
    if (recordId == null) throw new ForbiddenError();
    const expedient = await this.expedientRepository.getExpedient(recordId);
    if (!expedient || (typeof expedient === "object" && "code" in expedient)) {
      throw new ForbiddenError();
    }
    const withPatient = expedient as typeof expedient & { patient?: { user_id: number } };
    if (withPatient.patient?.user_id !== currentUserId) {
      throw new ForbiddenError();
    }

    const context = await this.contextService.getCurrentSessionContext(input.conversationId);
    const section = input.section ?? "full";
    const sectionInstruction =
      section === "evolution"
        ? "Redacta solo la sección de evolución (qué se trabajó, cómo llegó el paciente)."
        : section === "closing"
          ? "Redacta solo el cierre o conclusiones de la sesión."
          : "Redacta un borrador completo de nota clínica (evolución, intervención, plan o cierre).";

    const systemMessage =
      "Eres un asistente para terapeutas. Te proporciono la transcripción o resumen de una sesión. Genera un borrador de nota clínica profesional, en español, que el terapeuta pueda revisar y editar.";
    const userMessage = `Contexto de la sesión:\n${context}\n\n${sectionInstruction}`;

    const suggestion = await this.openAIChat.chat(systemMessage, userMessage);
    return { suggestion };
  }
}
