/**
 * Punto de entrada del worker que consume la cola neurofile-audio-fragments (Fase 4.1, 4.2).
 * Ejecutar con: npm run worker:fragments
 */
import "dotenv/config";
import { AudioFragmentRepositoryImpl } from "../infrastructure/repositories/AudioFragmentRepositoryImpl";
import { SqsServiceImpl } from "../infrastructure/services/SqsServiceImpl";
import {
  runFragmentsConsumerLoop,
  type FragmentMessagePayload,
} from "./fragments-consumer";

const sqsService = new SqsServiceImpl();
const audioFragmentRepository = new AudioFragmentRepositoryImpl();

/**
 * Upsert del fragmento por (conversation_id, sequence_index). Estado inicial `pending`.
 * Tras éxito devuelve true (se borra el mensaje); en error false (reintento).
 */
async function handleFragmentMessage(
  payload: FragmentMessagePayload
): Promise<boolean> {
  try {
    const recordedAt = new Date(payload.recordedAt);
    if (Number.isNaN(recordedAt.getTime())) {
      console.error("[worker:fragments] recordedAt inválido:", payload.recordedAt);
      return false;
    }

    await audioFragmentRepository.upsert({
      conversation_id: payload.conversationId,
      sequence_index: payload.sequenceIndex,
      recorded_at: recordedAt,
      s3_key: payload.s3Key,
      s3_bucket: process.env.S3_BUCKET_AUDIO ?? null,
    });

    return true;
  } catch (err) {
    console.error("[worker:fragments] Error en upsert:", payload, err);
    return false;
  }
}

console.log("[worker:fragments] Iniciando consumidor de neurofile-audio-fragments...");
runFragmentsConsumerLoop(sqsService, handleFragmentMessage).catch((err) => {
  console.error("[worker:fragments] Fatal:", err);
  process.exit(1);
});
