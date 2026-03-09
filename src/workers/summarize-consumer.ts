import type { ISqsService } from "../domain/services/ISqsService";

/**
 * Payload del mensaje en la cola neurofile-summarize-map (Fase 6).
 */
export interface SummarizeMessagePayload {
  conversationId: number;
}

const QUEUE_KEY = "summarize-map" as const;
const WAIT_TIME_SECONDS = 20;

function toNumber(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") return parseInt(value, 10);
  return Number.NaN;
}

/**
 * Parsea el body del mensaje y extrae conversationId.
 */
export function extractSummarizePayload(
  body: string
): SummarizeMessagePayload | null {
  try {
    const raw = JSON.parse(body) as Record<string, unknown>;
    const conversationId = toNumber(raw.conversationId);
    if (Number.isNaN(conversationId) || conversationId <= 0) return null;
    return { conversationId };
  } catch {
    return null;
  }
}

export type ProcessSummarizeHandler = (
  payload: SummarizeMessagePayload
) => Promise<boolean>;

/**
 * Bucle de consumo de la cola neurofile-summarize-map.
 * Mensajes inválidos no se borran: tras maxReceiveCount la redrive policy los mueve a la DLQ.
 */
export async function runSummarizeConsumerLoop(
  sqsService: ISqsService,
  onMessage: ProcessSummarizeHandler
): Promise<void> {
  const queueUrl = sqsService.getQueueUrl(QUEUE_KEY);
  console.log(
    "[worker:summarize-map] Conectado a la cola neurofile-summarize-map, long poll cada %ss",
    WAIT_TIME_SECONDS
  );

  let pollCount = 0;

  for (;;) {
    try {
      const messages = await sqsService.receiveMessages(queueUrl, {
        maxNumberOfMessages: 10,
        waitTimeSeconds: WAIT_TIME_SECONDS,
      });

      pollCount += 1;
      if (messages.length > 0) {
        console.log(
          "[worker:summarize-map] Recibidos %s mensaje(s) de la cola",
          messages.length
        );
      } else if (pollCount % 3 === 1) {
        console.log(
          "[worker:summarize-map] En espera de mensajes (poll #%s)...",
          pollCount
        );
      }

      for (const message of messages) {
        const payload = extractSummarizePayload(message.body);
        if (!payload) {
          console.error(
            "[worker:summarize-map] Mensaje con formato inválido (no se borra; tras maxReceiveCount irá a DLQ). messageId=%s body=%s",
            message.messageId,
            message.body
          );
          continue;
        }
        console.log(
          "[worker:summarize-map] Mensaje recibido. messageId=%s conversationId=%s",
          message.messageId,
          payload.conversationId
        );
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
            "[worker:summarize-map] Error al procesar mensaje. conversationId=%s messageId=%s error=%s",
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
        "[worker:summarize-map] Error en receiveMessages (reintento en 2s): %s",
        errStr
      );
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
