/**
 * Servicio de contexto para el terapeuta: última sesión, evolución, sesión actual.
 * Usado por la API (endpoints + OpenAI) y por el servidor MCP (tools/recursos).
 */
import type { IConversationRepository } from "../../domain/repositories/IConversationRepository";
import type { IClinicalNotesRepository } from "../../domain/repositories/IClinicalNotesRepository";
import type { IExpedientDraftRepository } from "../../domain/repositories/IExpedientDraftRepository";
import type { IExpedientRepository } from "../../domain/repositories/IExpedientsRepository";

export interface TherapistContextDeps {
  conversationRepository: IConversationRepository;
  clinicalNotesRepository: IClinicalNotesRepository;
  expedientDraftRepository: IExpedientDraftRepository;
  expedientRepository: IExpedientRepository;
}

export class TherapistContextService {
  constructor(private deps: TherapistContextDeps) {}

  /**
   * Resuelve patientId → recordId (primer expediente del paciente).
   */
  async getRecordIdByPatientId(patientId: number): Promise<number | null> {
    return this.deps.expedientRepository.getRecordIdByPatientId(patientId);
  }

  /**
   * Contexto de la última sesión: transcripción o resumen (draft) listo para prompt.
   */
  async getLastSessionContext(recordId: number): Promise<string> {
    const last = await this.deps.conversationRepository.getLastByRecordId(recordId);
    if (!last) return "";
    const text =
      last.full_transcription?.trim() ||
      (last.expedientDraft?.payload != null
        ? JSON.stringify(last.expedientDraft.payload, null, 2)
        : "");
    const dateStr = last.started_at ? new Date(last.started_at).toISOString().slice(0, 10) : "";
    return `Última sesión (${dateStr}):\n${text || "(Sin transcripción ni resumen aún)"}`;
  }

  /**
   * Contexto de evolución: notas clínicas + resúmenes de conversaciones en los últimos months.
   */
  async getEvolutionContext(recordId: number, months: number = 6): Promise<string> {
    const since = new Date();
    since.setMonth(since.getMonth() - months);
    const dateFrom = since.toISOString().slice(0, 10);
    const dateTo = new Date().toISOString().slice(0, 10);

    const [notesResult, conversations] = await Promise.all([
      this.deps.clinicalNotesRepository.getNotes(recordId, dateFrom, dateTo),
      this.deps.conversationRepository.listByRecordId(recordId, 50),
    ]);

    const notes = Array.isArray(notesResult) ? notesResult : [];
    const lines: string[] = [];

    for (const n of notes) {
      const d = "date" in n ? String(n.date).slice(0, 10) : "";
      const note = "note" in n ? String(n.note) : "";
      lines.push(`[Nota ${d}] ${note}`);
    }

    const inRange = (startedAt: Date) => {
      const t = new Date(startedAt).getTime();
      return t >= since.getTime();
    };

    for (const c of conversations) {
      if (!inRange(c.started_at)) continue;
      const draft = await this.deps.expedientDraftRepository.getByConversationId(c.id);
      const summary =
        c.full_transcription?.trim() ||
        (draft?.payload != null ? JSON.stringify(draft.payload) : "(sin resumen)");
      const d = new Date(c.started_at).toISOString().slice(0, 10);
      lines.push(`[Sesión ${d}] ${summary}`);
    }

    return lines.length === 0
      ? `No hay notas ni sesiones en los últimos ${months} meses.`
      : lines.join("\n\n");
  }

  /**
   * Contexto de la conversación actual (para sugerir nota clínica).
   */
  async getCurrentSessionContext(conversationId: number): Promise<string> {
    const conv = await this.deps.conversationRepository.getById(conversationId);
    if (!conv) return "";
    const draft = await this.deps.expedientDraftRepository.getByConversationId(conversationId);
    const text =
      conv.full_transcription?.trim() ||
      (draft?.payload != null ? JSON.stringify(draft.payload, null, 2) : "");
    const dateStr = conv.started_at ? new Date(conv.started_at).toISOString().slice(0, 10) : "";
    return `Sesión ${dateStr} (id=${conversationId}):\n${text || "(Sin transcripción ni resumen aún)"}`;
  }
}
