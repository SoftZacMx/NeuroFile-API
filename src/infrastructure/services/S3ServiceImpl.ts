import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IS3Service } from "../../domain/services/IS3Service";

const DEFAULT_PRESIGN_EXPIRES = 900; // 15 min

/**
 * Implementación del servicio S3 usando AWS SDK v3.
 * Usa variables de entorno: AWS_REGION, S3_BUCKET_AUDIO; opcional S3_ENDPOINT (MinIO/local).
 * Para MinIO local: opcional S3_ACCESS_KEY_ID y S3_SECRET_ACCESS_KEY (ej. minioadmin/minioadmin);
 * si no se setean, se usan AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY (LocalStack usa test/test).
 */
export class S3ServiceImpl implements IS3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const region = process.env.AWS_REGION ?? "us-east-1";
    const endpoint = process.env.S3_ENDPOINT; // MinIO: http://localhost:9000
    this.bucket =
      process.env.S3_BUCKET_AUDIO ?? "neurofile-audio-local";

    const s3AccessKey = process.env.S3_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
    const s3SecretKey = process.env.S3_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;

    this.client = new S3Client({
      region,
      ...(s3AccessKey && s3SecretKey && {
        credentials: { accessKeyId: s3AccessKey, secretAccessKey: s3SecretKey },
      }),
      ...(endpoint && {
        endpoint,
        forcePathStyle: true, // necesario para MinIO
      }),
    });
  }

  async getPresignedPutUrl(
    s3Key: string,
    expiresInSeconds: number = DEFAULT_PRESIGN_EXPIRES
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async getObject(s3Key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
    });
    const response = await this.client.send(command);
    const body = response.Body;
    if (!body) {
      throw new Error(`S3 getObject: no body for key ${s3Key}`);
    }
    const chunks: Uint8Array[] = [];
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async putObject(s3Key: string, body: Buffer): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      Body: body,
    });
    await this.client.send(command);
  }
}
