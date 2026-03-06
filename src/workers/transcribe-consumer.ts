import type { ISqsService } from "../domain/services/ISqsService";

/**
 * Payload del mensaje en la cola neurofile-transcribe-conversation (Fase 5.3).
 */
export interface TranscribeMessagePayload {
  conversationId: number;
}

const QUEUE_KEY = "transcribe-conversation" as const;
const WAIT_TIME_SECONDS = 20;

function toNumber(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") return parseInt(value, 10);
  return Number.NaN;
}

/**
 * Parsea el body del mensaje y extrae conversationId.
 * @returns Payload o null si el formato es inválido.
 */
export function extractTranscribePayload(
  body: string
): TranscribeMessagePayload | null {
  try {
    const raw = JSON.parse(body) as Record<string, unknown>;

    const conversationId = toNumber(raw.conversationId);
    if (Number.isNaN(conversationId) || conversationId <= 0) return null;

    return { conversationId };
  } catch {
    return null;
  }
}

export type ProcessTranscribeHandler = (
  payload: TranscribeMessagePayload
) => Promise<boolean>;

/**
 * Ejecuta el bucle de consumo de la cola neurofile-transcribe-conversation (long poll).
 * Por cada mensaje: extrae conversationId; llama a onMessage.
 * Si onMessage devuelve true, borra el mensaje de la cola; si false o error, no borra (reintento).
 */
export async function runTranscribeConsumerLoop(
  sqsService: ISqsService,
  onMessage: ProcessTranscribeHandler
): Promise<void> {
  const queueUrl = sqsService.getQueueUrl(QUEUE_KEY);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const messages = await sqsService.receiveMessages(queueUrl, {
        maxNumberOfMessages: 10,
        waitTimeSeconds: WAIT_TIME_SECONDS,
      });

      for (const message of messages) {
        const payload = extractTranscribePayload(message.body);

        if (!payload) {
          console.error(
            "[worker:transcribe] Mensaje con formato inválido, se deja en cola. messageId=%s body=%s",
            message.messageId,
            message.body
          );
          continue;
        }

        try {
          const success = await onMessage(payload);
          if (success) {
            await sqsService.deleteMessage(queueUrl, message.receiptHandle);
          }
        } catch (err) {
          const errStr =
            err instanceof Error
              ? err.stack
                ? `${err.message}\n${err.stack}`
                : err.message
              : String(err);
          console.error(
            "[worker:transcribe] Error al procesar mensaje. conversationId=%s messageId=%s error=%s",
            payload.conversationId,
            message.messageId,
            errStr
          );
        }
      }
    } catch (err) {
      const errStr =
        err instanceof Error
          ? err.stack
            ? `${err.message}\n${err.stack}`
            : err.message
          : String(err);
      console.error(
        "[worker:transcribe] Error en receiveMessages (reintento en 2s): %s",
        errStr
      );
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
