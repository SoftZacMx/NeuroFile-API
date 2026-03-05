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
 */
export class S3ServiceImpl implements IS3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const region = process.env.AWS_REGION ?? "us-east-1";
    const endpoint = process.env.S3_ENDPOINT; // MinIO: http://localhost:9000
    this.bucket =
      process.env.S3_BUCKET_AUDIO ?? "neurofile-audio-local";

    this.client = new S3Client({
      region,
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
}
