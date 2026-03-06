import { IConversationRepository } from "../../../domain/repositories/IConversationRepository";
import { IExpedientRepository } from "../../../domain/repositories/IExpedientsRepository";
import { IPatientRepository } from "../../../domain/repositories/IPatientsRepository";
import { IPrismaError } from "../../../domain/errors/IPrismaErrors";
import { CreateRecordDTO } from "../../dtos/expedients/CreateExpedientDTO";
import { ExpedientDTO } from "../../dtos/expedients/ExpedientDTO";

export type CreateConversationResult =
  | { conversationId: number; startedAt: Date; recordId?: number }
  | { error: "RECORD_NOT_FOUND" | "PATIENT_NOT_FOUND" | "FORBIDDEN"; statusCode: number };

function emptyRecordDto(patientId: number): CreateRecordDTO {
  const empty = "";
  return {
    patient_id: patientId,
    incident_details: empty,
    physical_description: empty,
    treatment_demand: empty,
    school_area: empty,
    work_area: empty,
    significant_events: empty,
    psychosexual_history: empty,
    therapeutic_focus: empty,
    therapeutic_goal: empty,
    therapeutic_strategy: empty,
    therapeutic_forecast: empty,
    family_diagram: empty,
    family_relationship: empty,
    family_mapping: empty,
    diagnostic_impression: empty,
    family_hypothesis: empty,
    mental_exam: empty,
    diagnostic_notes: empty,
    consultation_reason: empty,
  };
}

/**
 * Crea una conversación para un expediente (record).
 * - Si se pasa recordId: valida que el record exista y que el usuario tenga permiso (expediente del paciente del usuario).
 * - Si se pasa patientId: valida que el paciente exista y pertenezca al usuario, crea un expediente vacío para ese paciente y luego la conversación; devuelve también recordId.
 */
export class CreateConversationUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly expedientRepository: IExpedientRepository,
    private readonly patientRepository: IPatientRepository
  ) {}

  async execute(
    params: { recordId: number } | { patientId: number },
    userId: number
  ): Promise<CreateConversationResult> {
    if ("recordId" in params) {
      return this.executeWithRecordId(params.recordId, userId);
    }
    return this.executeWithPatientId(params.patientId, userId);
  }

  private async executeWithRecordId(
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

  private async executeWithPatientId(
    patientId: number,
    userId: number
  ): Promise<CreateConversationResult> {
    const patient = await this.patientRepository.getPatient(String(patientId));

    if (!patient || (patient as IPrismaError).code) {
      return { error: "PATIENT_NOT_FOUND", statusCode: 404 };
    }

    const patientUserId = (patient as { user_id?: number }).user_id;
    if (patientUserId !== userId) {
      return { error: "FORBIDDEN", statusCode: 403 };
    }

    const createResult = await this.expedientRepository.createRecord(
      emptyRecordDto(patientId)
    );

    if ((createResult as IPrismaError).code) {
      return { error: "RECORD_NOT_FOUND", statusCode: 500 };
    }

    const record = createResult as ExpedientDTO;
    const conversation = await this.conversationRepository.create({
      record_id: record.id,
      user_id: userId,
    });

    return {
      conversationId: conversation.id,
      startedAt: conversation.started_at,
      recordId: record.id,
    };
  }
}
