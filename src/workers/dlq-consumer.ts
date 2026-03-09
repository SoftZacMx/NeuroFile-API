import type { ISqsService } from "../domain/services/ISqsService";
import { extractFragmentPayload } from "./fragments-consumer";
import { extractTranscribePayload } from "./transcribe-consumer";
import { extractSummarizePayload } from "./summarize-consumer";

export type DlqQueueKey = "audio-fragments" | "transcribe-conversation" | "summarize-map";

const DLQ_QUEUE_KEYS: DlqQueueKey[] = [
  "audio-fragments",
  "transcribe-conversation",
  "summarize-map",
];

const DLQ_RESEND_ATTR = "dlq_resend_count";
const MAX_DLQ_RESEND = 2;
const WAIT_TIME_SECONDS = 10;
const MAX_MESSAGES = 10;

type Extractor = (body: string) => { conversationId: number } | { conversationId: number; sequenceIndex: number; recordedAt: string; s3Key: string } | null;

function getExtractor(queueKey: DlqQueueKey): Extractor {
  switch (queueKey) {
    case "audio-fragments":
      return extractFragmentPayload as Extractor;
    case "transcribe-conversation":
      return extractTranscribePayload;
    case "summarize-map":
      return extractSummarizePayload;
    default:
      throw new Error(`Unknown queue key: ${queueKey}`);
  }
}

/**
 * Procesa mensajes de una DLQ: reenvía a la cola principal con tope de reintentos
 * o descarta si no se puede parsear o se superó el límite.
 */
async function processDlqQueue(
  sqsService: ISqsService,
  queueKey: DlqQueueKey
): Promise<void> {
  const dlqUrl = sqsService.getDlqQueueUrl(queueKey);
  const mainUrl = sqsService.getQueueUrl(queueKey);
  const extract = getExtractor(queueKey);

  const messages = await sqsService.receiveMessages(dlqUrl, {
    maxNumberOfMessages: MAX_MESSAGES,
    waitTimeSeconds: WAIT_TIME_SECONDS,
    messageAttributeNames: ["All"],
  });

  for (const msg of messages) {
    const payload = extract(msg.body);
    if (payload === null) {
      await sqsService.deleteMessage(dlqUrl, msg.receiptHandle);
      console.error(
        `[dlq:${queueKey}] Mensaje no parseable, eliminado de DLQ (messageId=${msg.messageId})`
      );
      continue;
    }

    const countRaw = msg.attributes?.[DLQ_RESEND_ATTR];
    const count = countRaw != null ? parseInt(String(countRaw), 10) : 0;
    const validCount = Number.isNaN(count) ? 0 : count;

    if (validCount >= MAX_DLQ_RESEND) {
      await sqsService.deleteMessage(dlqUrl, msg.receiptHandle);
      console.error(
        `[dlq:${queueKey}] Máximo de reintentos alcanzado (${validCount}), eliminado de DLQ (messageId=${msg.messageId})`
      );
      continue;
    }

    const nextCount = validCount + 1;
    await sqsService.sendMessage(mainUrl, msg.body, {
      [DLQ_RESEND_ATTR]: {
        DataType: "Number",
        StringValue: String(nextCount),
      },
    });
    await sqsService.deleteMessage(dlqUrl, msg.receiptHandle);
    console.log(
      `[dlq:${queueKey}] Reenviado a cola principal (messageId=${msg.messageId}, resend=${nextCount})`
    );
  }
}

/**
 * Bucle del consumidor DLQ: recorre las 3 DLQs, recibe mensajes,
 * reenvía a la cola principal (con tope de reintentos) o descarta.
 */
export async function runDlqConsumerLoop(sqsService: ISqsService): Promise<void> {
  console.error(
    "[worker:dlq] Iniciando consumidor DLQ (audio-fragments, transcribe-conversation, summarize-map)"
  );
  for (;;) {
    for (const queueKey of DLQ_QUEUE_KEYS) {
      try {
        await processDlqQueue(sqsService, queueKey);
      } catch (err) {
        console.error(`[worker:dlq] Error procesando DLQ ${queueKey}:`, err);
      }
    }
  }
}
