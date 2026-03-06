/**
 * Punto de entrada del worker que consume la cola neurofile-transcribe-conversation (Fase 5.3–5.5).
 * Por cada mensaje: extrae conversationId; transcribe cada fragmento; concatena, guarda full_transcription y encola summarize-map.
 * Ejecutar con: npm run worker:transcribe
 */
import "dotenv/config";
import { ConversationRepositoryImpl } from "../infrastructure/repositories/ConversationRepositoryImpl";
import { AudioFragmentRepositoryImpl } from "../infrastructure/repositories/AudioFragmentRepositoryImpl";
import { SqsServiceImpl } from "../infrastructure/services/SqsServiceImpl";
import { S3ServiceImpl } from "../infrastructure/services/S3ServiceImpl";
import { WhisperServiceImpl } from "../infrastructure/services/WhisperServiceImpl";
import { WhisperLocalServiceImpl } from "../infrastructure/services/WhisperLocalServiceImpl";
import type { IWhisperService } from "../domain/services/IWhisperService";
import { GetFragmentAudioUseCase } from "../aplication/use-cases/transcription/GetFragmentAudioUseCase";
import {
  runTranscribeConsumerLoop,
  type TranscribeMessagePayload,
} from "./transcribe-consumer";

const conversationRepository = new ConversationRepositoryImpl();
const audioFragmentRepository = new AudioFragmentRepositoryImpl();
const sqsService = new SqsServiceImpl();
const s3Service = new S3ServiceImpl();

const whisperProvider = (process.env.WHISPER_PROVIDER ?? "openai").toLowerCase();
const whisperService: IWhisperService =
  whisperProvider === "local"
    ? new WhisperLocalServiceImpl()
    : new WhisperServiceImpl();
const getFragmentAudioUseCase = new GetFragmentAudioUseCase(s3Service);

/** Serializa un error para logs (mensaje + stack si existe). */
function formatError(err: unknown): string {
  if (err instanceof Error) {
    return err.stack ? `${err.message}\n${err.stack}` : err.message;
  }
  return String(err);
}

/**
 * Lógica de transcripción por fragmento (Fase 5.4).
 * Idempotente si ya está transcrita; si no, marca transcribing, descarga cada fragmento de S3,
 * transcribe con Whisper, guarda transcription_text y status en cada AudioFragment.
 * En error marca la conversación como failed y no borra el mensaje (reintento).
 */
async function handleTranscribeMessage(
  payload: TranscribeMessagePayload
): Promise<boolean> {
  const { conversationId } = payload;
  console.log("[worker:transcribe] Procesando mensaje. conversationId=%s", conversationId);

  const conversation = await conversationRepository.getById(conversationId);
  if (!conversation) {
    console.error(
      "[worker:transcribe] Conversación no encontrada. conversationId=%s",
      conversationId
    );
    return true;
  }

  if (
    conversation.transcription_status === "transcribed" &&
    conversation.full_transcription?.trim()
  ) {
    return true;
  }

  await conversationRepository.setTranscriptionStatus(
    conversationId,
    "transcribing"
  );

  const fragments = await audioFragmentRepository.listByConversationId(
    conversationId
  );
  if (fragments.length === 0) {
    console.warn(
      "[worker:transcribe] Sin fragmentos; marcando conversación como failed. conversationId=%s",
      conversationId
    );
    await conversationRepository.setTranscriptionStatus(
      conversationId,
      "failed"
    );
    return false;
  }

  const transcriptionParts: string[] = [];

  for (const fragment of fragments) {
    const audioResult = await getFragmentAudioUseCase.execute(fragment.s3_key);
    if ("error" in audioResult) {
      console.error(
        "[worker:transcribe] Error al descargar fragmento. conversationId=%s s3_key=%s error=%s",
        conversationId,
        fragment.s3_key,
        formatError(audioResult.error)
      );
      await audioFragmentRepository.updateTranscription({
        conversation_id: conversationId,
        sequence_index: fragment.sequence_index,
        transcription_text: "",
        status: "failed",
      });
      await conversationRepository.setTranscriptionStatus(
        conversationId,
        "failed"
      );
      return false;
    }

    let text: string;
    try {
      text = await whisperService.transcribe(audioResult.buffer, {
        filename: fragment.s3_key.split("/").pop() || "audio.webm",
      });
    } catch (err) {
      console.error(
        "[worker:transcribe] Error Whisper en fragmento. conversationId=%s sequence_index=%s s3_key=%s error=%s",
        conversationId,
        fragment.sequence_index,
        fragment.s3_key,
        formatError(err)
      );
      await audioFragmentRepository.updateTranscription({
        conversation_id: conversationId,
        sequence_index: fragment.sequence_index,
        transcription_text: "",
        status: "failed",
      });
      await conversationRepository.setTranscriptionStatus(
        conversationId,
        "failed"
      );
      return false;
    }

    console.log(
      "[worker:transcribe] Whisper OK. conversationId=%s sequence_index=%s",
      conversationId,
      fragment.sequence_index
    );
    await audioFragmentRepository.updateTranscription({
      conversation_id: conversationId,
      sequence_index: fragment.sequence_index,
      transcription_text: text,
      status: "transcribed",
    });
    transcriptionParts.push(text);
  }

  // Fase 5.5: concatenar, guardar full_transcription y encolar summarize-map
  try {
    const fullTranscription = transcriptionParts.join("\n\n");
    await conversationRepository.setFullTranscription(
      conversationId,
      fullTranscription
    );
    const summarizeQueueUrl = sqsService.getQueueUrl("summarize-map");
    console.log(
      "[worker:transcribe] Encolando conversationId=%s en neurofile-summarize-map",
      conversationId
    );
    await sqsService.sendMessage(summarizeQueueUrl, { conversationId });
    console.log(
      "[worker:transcribe] Mensaje encolado correctamente. conversationId=%s",
      conversationId
    );
    console.log(
      "[worker:transcribe] Transcripción completada. conversationId=%s fragmentos=%s",
      conversationId,
      transcriptionParts.length
    );
  } catch (err) {
    console.error(
      "[worker:transcribe] Error al guardar full_transcription o al encolar en neurofile-summarize-map. conversationId=%s error=%s",
      conversationId,
      formatError(err)
    );
    await conversationRepository.setTranscriptionStatus(
      conversationId,
      "failed"
    );
    return false;
  }

  return true;
}

console.log(
  "[worker:transcribe] Iniciando consumidor de neurofile-transcribe-conversation (Whisper: %s)...",
  whisperProvider
);
runTranscribeConsumerLoop(sqsService, handleTranscribeMessage).catch((err) => {
  console.error("[worker:transcribe] Fatal:", err);
  process.exit(1);
});
