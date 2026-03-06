/**
 * Servicio S3 para almacenamiento de fragmentos de audio (Fase 2.1).
 * Genera presigned URLs para subida y descarga de objetos por key.
 */
export interface IS3Service {
  /**
   * Genera una URL firmada (PUT) para que el cliente suba un objeto directamente a S3.
   * @param s3Key Clave del objeto en el bucket (ej. conversations/{id}/fragments/{index}.webm)
   * @param expiresInSeconds Tiempo de validez de la URL en segundos (por defecto 900 = 15 min)
   */
  getPresignedPutUrl(s3Key: string, expiresInSeconds?: number): Promise<string>;

  /**
   * Descarga un objeto del bucket y devuelve su contenido como buffer.
   * @param s3Key Clave del objeto
   * @returns Contenido del archivo (ej. audio para Whisper)
   */
  getObject(s3Key: string): Promise<Buffer>;

  /**
   * Sube un objeto al bucket (desde la API). Usado cuando el cliente envía el archivo a la API.
   * @param s3Key Clave del objeto
   * @param body Contenido del archivo (buffer)
   */
  putObject(s3Key: string, body: Buffer): Promise<void>;
}
