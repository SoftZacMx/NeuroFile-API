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
exports.SqsServiceImpl = void 0;
const client_sqs_1 = require("@aws-sdk/client-sqs");
const LOCALSTACK_ACCOUNT_ID = "000000000000";
const DEFAULT_WAIT_TIME_SECONDS = 20;
const DEFAULT_MAX_MESSAGES = 10;
const QUEUE_ENV_KEYS = {
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
class SqsServiceImpl {
    constructor() {
        var _a;
        const region = (_a = process.env.AWS_REGION) !== null && _a !== void 0 ? _a : "us-east-1";
        const endpoint = process.env.SQS_ENDPOINT; // LocalStack: http://localhost:4566
        this.client = new client_sqs_1.SQSClient(Object.assign({ region }, (endpoint && { endpoint })));
    }
    getQueueUrl(queueKey) {
        const { urlKey, nameKey } = QUEUE_ENV_KEYS[queueKey];
        const url = process.env[urlKey];
        if (url)
            return url;
        const endpoint = process.env.SQS_ENDPOINT;
        const name = process.env[nameKey];
        if (!endpoint || !name) {
            throw new Error(`SQS: define ${urlKey} o SQS_ENDPOINT + ${nameKey} para la cola "${queueKey}"`);
        }
        // LocalStack: http://localhost:4566/000000000000/neurofile-audio-fragments
        const base = endpoint.replace(/\/$/, "");
        return `${base}/${LOCALSTACK_ACCOUNT_ID}/${name}`;
    }
    sendMessage(queueUrl, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageBody = typeof body === "string" ? body : JSON.stringify(body);
            yield this.client.send(new client_sqs_1.SendMessageCommand({
                QueueUrl: queueUrl,
                MessageBody: messageBody,
            }));
        });
    }
    receiveMessages(queueUrl, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const response = yield this.client.send(new client_sqs_1.ReceiveMessageCommand({
                QueueUrl: queueUrl,
                MaxNumberOfMessages: (_a = options === null || options === void 0 ? void 0 : options.maxNumberOfMessages) !== null && _a !== void 0 ? _a : DEFAULT_MAX_MESSAGES,
                WaitTimeSeconds: (_b = options === null || options === void 0 ? void 0 : options.waitTimeSeconds) !== null && _b !== void 0 ? _b : DEFAULT_WAIT_TIME_SECONDS,
            }));
            const messages = (_c = response.Messages) !== null && _c !== void 0 ? _c : [];
            return messages.map((m) => {
                var _a;
                return ({
                    messageId: m.MessageId,
                    receiptHandle: m.ReceiptHandle,
                    body: (_a = m.Body) !== null && _a !== void 0 ? _a : "",
                });
            });
        });
    }
    deleteMessage(queueUrl, receiptHandle) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.send(new client_sqs_1.DeleteMessageCommand({
                QueueUrl: queueUrl,
                ReceiptHandle: receiptHandle,
            }));
        });
    }
}
exports.SqsServiceImpl = SqsServiceImpl;
