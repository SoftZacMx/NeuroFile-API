/**
 * Mensaje recibido de SQS (Fase 2.2).
 */
export interface SqsMessage {
  messageId: string;
  receiptHandle: string;
  body: string;
}

/**
 * Servicio SQS para envío, recepción (long polling) y borrado de mensajes (Fase 2.2).
 * Usa URLs de colas desde env.
 */
export interface ISqsService {
  /**
   * Envía un mensaje a la cola. Si body es un objeto, se serializa a JSON.
   */
  sendMessage(
    queueUrl: string,
    body: Record<string, unknown> | string
  ): Promise<void>;

  /**
   * Recibe mensajes con long polling. WaitTimeSeconds recomendado 1–20.
   * @returns Lista de mensajes (puede ser vacía).
   */
  receiveMessages(
    queueUrl: string,
    options?: { maxNumberOfMessages?: number; waitTimeSeconds?: number }
  ): Promise<SqsMessage[]>;

  /**
   * Borra un mensaje de la cola tras procesarlo (usar receiptHandle del mensaje recibido).
   */
  deleteMessage(queueUrl: string, receiptHandle: string): Promise<void>;

  /**
   * Resuelve la URL de una cola por nombre (usa env: SQS_QUEUE_URL_* o SQS_ENDPOINT + nombre).
   */
  getQueueUrl(
    queueKey: "audio-fragments" | "transcribe-conversation" | "summarize-map"
  ): string;
}
