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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3ServiceImpl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const DEFAULT_PRESIGN_EXPIRES = 900; // 15 min
/**
 * Implementación del servicio S3 usando AWS SDK v3.
 * Usa variables de entorno: AWS_REGION, S3_BUCKET_AUDIO; opcional S3_ENDPOINT (MinIO/local).
 */
class S3ServiceImpl {
    constructor() {
        var _a, _b;
        const region = (_a = process.env.AWS_REGION) !== null && _a !== void 0 ? _a : "us-east-1";
        const endpoint = process.env.S3_ENDPOINT; // MinIO: http://localhost:9000
        this.bucket =
            (_b = process.env.S3_BUCKET_AUDIO) !== null && _b !== void 0 ? _b : "neurofile-audio-local";
        this.client = new client_s3_1.S3Client(Object.assign({ region }, (endpoint && {
            endpoint,
            forcePathStyle: true, // necesario para MinIO
        })));
    }
    getPresignedPutUrl(s3Key_1) {
        return __awaiter(this, arguments, void 0, function* (s3Key, expiresInSeconds = DEFAULT_PRESIGN_EXPIRES) {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucket,
                Key: s3Key,
            });
            return (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: expiresInSeconds });
        });
    }
    getObject(s3Key) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucket,
                Key: s3Key,
            });
            const response = yield this.client.send(command);
            const body = response.Body;
            if (!body) {
                throw new Error(`S3 getObject: no body for key ${s3Key}`);
            }
            const chunks = [];
            try {
                for (var _d = true, _e = __asyncValues(body), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const chunk = _c;
                    chunks.push(chunk);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return Buffer.concat(chunks);
        });
    }
}
exports.S3ServiceImpl = S3ServiceImpl;
