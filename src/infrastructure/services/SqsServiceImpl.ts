import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import type { ISqsService, SqsMessage } from "../../domain/services/ISqsService";

const LOCALSTACK_ACCOUNT_ID = "000000000000";
const DEFAULT_WAIT_TIME_SECONDS = 20;
const DEFAULT_MAX_MESSAGES = 10;

type QueueKey = "audio-fragments" | "transcribe-conversation" | "summarize-map";

const QUEUE_ENV_KEYS: Record<
  QueueKey,
  { urlKey: string; nameKey: string }
> = {
  "audio-fragments": {
    urlKey: "SQS_QUEUE_URL_AUDIO_FRAGMENTS",
    nameKey: "SQS_QUEUE_AUDIO_FRAGMENTS",
  },
  "transcribe-conversation": {
    urlKey: "SQS_QUEUE_URL_TRANSCRIBE_CONVERSATION",
    nameKey: "SQS_QUEUE_TRANSCRIBE_CONVERSATION",
  },
  "summarize-map": {
    urlKey: "SQS_QUEUE_URL_SUMMARIZE_MAP",
    nameKey: "SQS_QUEUE_SUMMARIZE_MAP",
  },
};

/**
 * Implementación del servicio SQS con AWS SDK v3.
 * Usa AWS_REGION, SQS_ENDPOINT (opcional, LocalStack); URLs de colas desde env o construidas.
 */
export class SqsServiceImpl implements ISqsService {
  private readonly client: SQSClient;

  constructor() {
    const region = process.env.AWS_REGION ?? "us-east-1";
    const endpoint = process.env.SQS_ENDPOINT; // LocalStack: http://localhost:4566

    this.client = new SQSClient({
      region,
      ...(endpoint && { endpoint }),
    });
  }

  getQueueUrl(
    queueKey: "audio-fragments" | "transcribe-conversation" | "summarize-map"
  ): string {
    const { urlKey, nameKey } = QUEUE_ENV_KEYS[queueKey];
    const url = process.env[urlKey];
    if (url) return url;

    const endpoint = process.env.SQS_ENDPOINT;
    const name = process.env[nameKey];
    if (!endpoint || !name) {
      throw new Error(
        `SQS: define ${urlKey} o SQS_ENDPOINT + ${nameKey} para la cola "${queueKey}"`
      );
    }
    // LocalStack: http://localhost:4566/000000000000/neurofile-audio-fragments
    const base = endpoint.replace(/\/$/, "");
    return `${base}/${LOCALSTACK_ACCOUNT_ID}/${name}`;
  }

  async sendMessage(
    queueUrl: string,
    body: Record<string, unknown> | string
  ): Promise<void> {
    const messageBody =
      typeof body === "string" ? body : JSON.stringify(body);
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: messageBody,
      })
    );
  }

  async receiveMessages(
    queueUrl: string,
    options?: { maxNumberOfMessages?: number; waitTimeSeconds?: number }
  ): Promise<SqsMessage[]> {
    const response = await this.client.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: options?.maxNumberOfMessages ?? DEFAULT_MAX_MESSAGES,
        WaitTimeSeconds: options?.waitTimeSeconds ?? DEFAULT_WAIT_TIME_SECONDS,
      })
    );

    const messages = response.Messages ?? [];
    return messages.map((m) => ({
      messageId: m.MessageId!,
      receiptHandle: m.ReceiptHandle!,
      body: m.Body ?? "",
    }));
  }

  async deleteMessage(
    queueUrl: string,
    receiptHandle: string
  ): Promise<void> {
    await this.client.send(
      new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      })
    );
  }
}
