/**
 * Punto de entrada del worker que consume las DLQs (audio-fragments, transcribe-conversation, summarize-map).
 * Reenvía mensajes parseables a la cola principal con tope de reintentos; descarta no parseables o que superen el límite.
 * Ejecutar con: npm run worker:dlq
 */
import "dotenv/config";
import { SqsServiceImpl } from "../infrastructure/services/SqsServiceImpl";
import { runDlqConsumerLoop } from "./dlq-consumer";

const sqsService = new SqsServiceImpl();

console.log("[worker:dlq] Iniciando consumidor de DLQs...");
runDlqConsumerLoop(sqsService).catch((err) => {
  console.error("[worker:dlq] Fatal:", err);
  process.exit(1);
});
