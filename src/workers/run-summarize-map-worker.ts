/**
 * Worker que consume la cola neurofile-summarize-map (Fase 6).
 * Por cada mensaje: obtiene la conversación con full_transcription, llama al LLM para mapear
 * a campos del expediente, guarda ExpedientDraft, actualiza el Record con el borrador y marca processed_at.
 * Ejecutar con: npm run worker:summarize-map
 */
import "dotenv/config";
import type { UpdateRecordDTO } from "../aplication/dtos/expedients/UpdateExpedientDTO";
import type { IPrismaError } from "../domain/errors/IPrismaErrors";
import { ConversationRepositoryImpl } from "../infrastructure/repositories/ConversationRepositoryImpl";
import { ExpedientDraftRepositoryImpl } from "../infrastructure/repositories/ExpedientDraftRepositoryImpl";
import { ExpedientRepositoryImpl } from "../infrastructure/repositories/ExpedientsRepositoryImplementation";
import { MapTranscriptionToExpedientServiceImpl } from "../infrastructure/services/MapTranscriptionToExpedientServiceImpl";
import { SqsServiceImpl } from "../infrastructure/services/SqsServiceImpl";
import {
  runSummarizeConsumerLoop,
  type SummarizeMessagePayload,
} from "./summarize-consumer";

const conversationRepository = new ConversationRepositoryImpl();
const draftRepository = new ExpedientDraftRepositoryImpl();
const expedientRepository = new ExpedientRepositoryImpl();
const sqsService = new SqsServiceImpl();
let mapService: MapTranscriptionToExpedientServiceImpl;

const STRING_KEYS = [
  "consultation_reason",
  "treatment_demand",
  "incident_details",
  "physical_description",
  "school_area",
  "work_area",
  "significant_events",
  "psychosexual_history",
  "family_diagram",
  "family_relationship",
  "family_mapping",
  "family_hypothesis",
  "therapeutic_focus",
  "therapeutic_goal",
  "therapeutic_strategy",
  "therapeutic_forecast",
  "mental_exam",
  "diagnostic_impression",
  "diagnostic_notes",
] as const;

/**
 * Convierte el payload del draft (LLM) a la forma que updateRecord usa en runtime
 * (campos string + symptoms/diagnoses/modalities como arrays de objetos).
 */
function draftPayloadToUpdateDto(payload: Record<string, unknown>): UpdateRecordDTO {
  const dto: Record<string, unknown> = {};
  for (const key of STRING_KEYS) {
    const v = payload[key];
    if (v !== undefined && v !== null) {
      dto[key] = String(v);
    }
  }
  if (Array.isArray(payload.symptoms)) {
    dto.symptoms = payload.symptoms.map((s: unknown) => ({
      detail: String((s as { detail?: unknown })?.detail ?? ""),
    }));
  }
  if (Array.isArray(payload.diagnoses)) {
    dto.diagnoses = payload.diagnoses.map((d: unknown) => {
      const o = d as { axis?: unknown; dcm?: unknown; cie?: unknown; disorder?: unknown };
      return {
        axis: o.axis ?? undefined,
        dcm: o.dcm ?? undefined,
        cie: o.cie ?? undefined,
        disorder: o.disorder ?? undefined,
      };
    });
  }
  if (Array.isArray(payload.modalities)) {
    dto.modalities = payload.modalities.map((m: unknown) => {
      const o = m as {
        ti?: unknown;
        tf?: unknown;
        tp?: unknown;
        tg?: unknown;
        other?: unknown;
        rationale?: unknown;
      };
      return {
        ti: o.ti ?? undefined,
        tf: o.tf ?? undefined,
        tp: o.tp ?? undefined,
        tg: o.tg ?? undefined,
        other: o.other ?? undefined,
        rationale: o.rationale ?? undefined,
      };
    });
  }
  return dto as UpdateRecordDTO;
}

function getMapService(): MapTranscriptionToExpedientServiceImpl {
  if (!mapService) {
    mapService = new MapTranscriptionToExpedientServiceImpl();
  }
  return mapService;
}

function formatError(err: unknown): string {
  if (err instanceof Error) {
    return err.stack ? `${err.message}\n${err.stack}` : err.message;
  }
  return String(err);
}

async function handleSummarizeMessage(
  payload: SummarizeMessagePayload
): Promise<boolean> {
  const { conversationId } = payload;
  console.log(
    "[worker:summarize-map] Procesando mensaje. conversationId=%s",
    conversationId
  );

  const conversation = await conversationRepository.getByIdWithRecord(
    conversationId
  );
  if (!conversation) {
    console.error(
      "[worker:summarize-map] Conversación no encontrada. conversationId=%s",
      conversationId
    );
    return true;
  }

  const transcription = conversation.full_transcription?.trim();
  if (!transcription) {
    console.warn(
      "[worker:summarize-map] Conversación sin full_transcription. conversationId=%s",
      conversationId
    );
    return true;
  }

  if (conversation.processed_at) {
    console.log(
      "[worker:summarize-map] Conversación ya procesada. conversationId=%s",
      conversationId
    );
    return true;
  }

  const recordId = conversation.record_id;
  const patientId = conversation.record.patient_id;

  try {
    const mapSvc = getMapService();
    const draftPayload = await mapSvc.mapTranscription(transcription, patientId);
    await draftRepository.upsert({
      conversation_id: conversationId,
      record_id: recordId,
      payload: draftPayload,
    });

    const updateDto = draftPayloadToUpdateDto(draftPayload);
    const updateResult = await expedientRepository.updateRecord(updateDto, recordId);
    if (updateResult && "code" in updateResult && (updateResult as IPrismaError).code) {
      console.error(
        "[worker:summarize-map] Error al actualizar Record con el borrador. recordId=%s",
        recordId
      );
      return false;
    }

    await conversationRepository.setProcessedAt(conversationId);
    console.log(
      "[worker:summarize-map] Borrador guardado y Record actualizado. conversationId=%s recordId=%s",
      conversationId,
      recordId
    );
    return true;
  } catch (err) {
    console.error(
      "[worker:summarize-map] Error al mapear o guardar draft. conversationId=%s error=%s",
      conversationId,
      formatError(err)
    );
    return false;
  }
}

console.log("[worker:summarize-map] Iniciando consumidor de neurofile-summarize-map...");
runSummarizeConsumerLoop(sqsService, handleSummarizeMessage).catch((err) => {
  console.error("[worker:summarize-map] Fatal:", err);
  process.exit(1);
});
