import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import type { Readable } from 'stream';

const BUCKET = process.env.S3_BUCKET || 'bluebook-ai-files';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT,
      credentials: process.env.S3_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
          }
        : undefined,
      forcePathStyle: true,
    });
  }
  return s3Client;
}

export function isFileStorageConfigured(): boolean {
  return !!(process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID);
}

export async function saveFile(
  projectId: string,
  fileName: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const key = `spading/${projectId}/${randomUUID()}-${fileName}`;
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return key;
}

export async function getFileStream(filePath: string): Promise<Readable> {
  const client = getS3Client();
  const response = await client.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: filePath,
    })
  );

  if (!response.Body) {
    throw new Error(`File not found: ${filePath}`);
  }

  return response.Body as Readable;
}

export async function deleteFile(filePath: string): Promise<void> {
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: filePath,
    })
  );
}
