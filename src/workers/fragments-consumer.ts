import type { ISqsService } from "../domain/services/ISqsService";

/**
 * Payload del mensaje en la cola neurofile-audio-fragments (Fase 4.1).
 */
export interface FragmentMessagePayload {
  conversationId: number;
  sequenceIndex: number;
  recordedAt: string;
  s3Key: string;
}

const QUEUE_KEY = "audio-fragments" as const;
const WAIT_TIME_SECONDS = 20;

function toNumber(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") return parseInt(value, 10);
  return Number.NaN;
}

function toString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Parsea el body del mensaje y extrae conversationId, sequenceIndex, recordedAt, s3Key.
 * @returns Payload o null si el formato es inválido.
 */
export function extractFragmentPayload(body: string): FragmentMessagePayload | null {
  try {
    const raw = JSON.parse(body) as Record<string, unknown>;

    const conversationId = toNumber(raw.conversationId);
    if (Number.isNaN(conversationId) || conversationId <= 0) return null;

    const sequenceIndex = toNumber(raw.sequenceIndex);
    if (Number.isNaN(sequenceIndex) || sequenceIndex < 0) return null;

    const recordedAt = toString(raw.recordedAt).trim();
    if (!recordedAt) return null;

    const s3Key = toString(raw.s3Key).trim();
    if (!s3Key) return null;

    return {
      conversationId,
      sequenceIndex,
      recordedAt,
      s3Key,
    };
  } catch {
    return null;
  }
}

export type ProcessFragmentHandler = (
  payload: FragmentMessagePayload
) => Promise<boolean>;

/**
 * Ejecuta el bucle de consumo de la cola neurofile-audio-fragments (long poll).
 * Por cada mensaje: extrae conversationId, sequenceIndex, recordedAt, s3Key; llama a onMessage.
 * Si onMessage devuelve true, borra el mensaje de la cola; si false o error, no borra (reintento).
 * Mensajes inválidos (payload mal formado) no se borran: SQS los reintenta hasta maxReceiveCount
 * y luego los mueve a la DLQ (redrive policy), evitando reintentos infinitos.
 */
export async function runFragmentsConsumerLoop(
  sqsService: ISqsService,
  onMessage: ProcessFragmentHandler
): Promise<void> {
  const queueUrl = sqsService.getQueueUrl(QUEUE_KEY);
  console.error(
    "[worker:fragments] Conectado a la cola neurofile-audio-fragments, long poll cada %ss",
    WAIT_TIME_SECONDS
  );

  let pollCount = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const messages = await sqsService.receiveMessages(queueUrl, {
        maxNumberOfMessages: 10,
        waitTimeSeconds: WAIT_TIME_SECONDS,
      });

      pollCount += 1;
      if (messages.length > 0) {
        console.error(
          "[worker:fragments] Recibidos %s mensaje(s) de la cola",
          messages.length
        );
      } else if (pollCount % 3 === 1) {
        console.error(
          "[worker:fragments] En espera de mensajes (poll #%s)...",
          pollCount
        );
      }

      for (const message of messages) {
        const payload = extractFragmentPayload(message.body);

        if (!payload) {
          console.error(
            "[worker:fragments] Mensaje con formato inválido (no se borra; tras maxReceiveCount irá a DLQ):",
            message.messageId
          );
          continue;
        }

        console.error(
          "[worker:fragments] Mensaje recibido de la cola. messageId=%s conversationId=%s sequenceIndex=%s",
          message.messageId,
          payload.conversationId,
          payload.sequenceIndex
        );
        try {
          const success = await onMessage(payload);
          if (success) {
            await sqsService.deleteMessage(queueUrl, message.receiptHandle);
          }
        } catch (err) {
          console.error(
            "[worker:fragments] Error al procesar mensaje:",
            message.messageId,
            err
          );
        }
      }
    } catch (err) {
      console.error("[worker:fragments] Error en receiveMessages:", err);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
