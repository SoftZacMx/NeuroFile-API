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
/**
 * Punto de entrada del worker que consume la cola neurofile-audio-fragments (Fase 4.1, 4.2).
 * Ejecutar con: npm run worker:fragments
 */
require("dotenv/config");
const AudioFragmentRepositoryImpl_1 = require("../infrastructure/repositories/AudioFragmentRepositoryImpl");
const SqsServiceImpl_1 = require("../infrastructure/services/SqsServiceImpl");
const fragments_consumer_1 = require("./fragments-consumer");
const sqsService = new SqsServiceImpl_1.SqsServiceImpl();
const audioFragmentRepository = new AudioFragmentRepositoryImpl_1.AudioFragmentRepositoryImpl();
/**
 * Upsert del fragmento por (conversation_id, sequence_index). Estado inicial `pending`.
 * Tras éxito devuelve true (se borra el mensaje); en error false (reintento).
 */
function handleFragmentMessage(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const recordedAt = new Date(payload.recordedAt);
            if (Number.isNaN(recordedAt.getTime())) {
                console.error("[worker:fragments] recordedAt inválido:", payload.recordedAt);
                return false;
            }
            yield audioFragmentRepository.upsert({
                conversation_id: payload.conversationId,
                sequence_index: payload.sequenceIndex,
                recorded_at: recordedAt,
                s3_key: payload.s3Key,
                s3_bucket: (_a = process.env.S3_BUCKET_AUDIO) !== null && _a !== void 0 ? _a : null,
            });
            return true;
        }
        catch (err) {
            console.error("[worker:fragments] Error en upsert:", payload, err);
            return false;
        }
    });
}
console.log("[worker:fragments] Iniciando consumidor de neurofile-audio-fragments...");
(0, fragments_consumer_1.runFragmentsConsumerLoop)(sqsService, handleFragmentMessage).catch((err) => {
    console.error("[worker:fragments] Fatal:", err);
    process.exit(1);
});
