"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFragmentPayload = extractFragmentPayload;
exports.runFragmentsConsumerLoop = runFragmentsConsumerLoop;
const QUEUE_KEY = "audio-fragments";
const WAIT_TIME_SECONDS = 20;
function toNumber(value) {
    if (typeof value === "number" && !Number.isNaN(value))
        return value;
    if (typeof value === "string")
        return parseInt(value, 10);
    return Number.NaN;
}
function toString(value) {
    return typeof value === "string" ? value : "";
}
/**
 * Parsea el body del mensaje y extrae conversationId, sequenceIndex, recordedAt, s3Key.
 * @returns Payload o null si el formato es inválido.
 */
function extractFragmentPayload(body) {
    try {
        const raw = JSON.parse(body);
        const conversationId = toNumber(raw.conversationId);
        if (Number.isNaN(conversationId) || conversationId <= 0)
            return null;
        const sequenceIndex = toNumber(raw.sequenceIndex);
        if (Number.isNaN(sequenceIndex) || sequenceIndex < 0)
            return null;
        const recordedAt = toString(raw.recordedAt).trim();
        if (!recordedAt)
            return null;
        const s3Key = toString(raw.s3Key).trim();
        if (!s3Key)
            return null;
        return {
            conversationId,
            sequenceIndex,
            recordedAt,
            s3Key,
        };
    }
    catch (_a) {
        return null;
    }
}
/**
 * Ejecuta el bucle de consumo de la cola neurofile-audio-fragments (long poll).
 * Por cada mensaje: extrae conversationId, sequenceIndex, recordedAt, s3Key; llama a onMessage.
 * Si onMessage devuelve true, borra el mensaje de la cola; si false o error, no borra (reintento).
 */
function runFragmentsConsumerLoop(sqsService, onMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        const queueUrl = sqsService.getQueueUrl(QUEUE_KEY);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                const messages = yield sqsService.receiveMessages(queueUrl, {
                    maxNumberOfMessages: 10,
                    waitTimeSeconds: WAIT_TIME_SECONDS,
                });
                for (const message of messages) {
                    const payload = extractFragmentPayload(message.body);
                    if (!payload) {
                        console.error("[worker:fragments] Mensaje con formato inválido, se deja en cola:", message.messageId);
                        continue;
                    }
                    try {
                        const success = yield onMessage(payload);
                        if (success) {
                            yield sqsService.deleteMessage(queueUrl, message.receiptHandle);
                        }
                    }
                    catch (err) {
                        console.error("[worker:fragments] Error al procesar mensaje:", message.messageId, err);
                    }
                }
            }
            catch (err) {
                console.error("[worker:fragments] Error en receiveMessages:", err);
                yield new Promise((r) => setTimeout(r, 2000));
            }
        }
    });
}
