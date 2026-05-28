import 'server-only';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'node:crypto';

export const S3_BUCKET = process.env.S3_BUCKET ?? 'qil-documents-523231703540';
export const S3_REGION = process.env.S3_REGION ?? process.env.AWS_REGION ?? 'ap-south-1';

declare global {
  // eslint-disable-next-line no-var
  var __qil_s3_client: S3Client | undefined;
}

// Amplify forbids env vars starting with "AWS_". Prefer S3_-prefixed names; fall back to AWS_ for local dev.
const accessKeyId = process.env.S3_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;

function buildClient(): S3Client {
  return new S3Client({
    region: S3_REGION,
    credentials: accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : undefined, // falls back to default credential chain (IAM role on Amplify)
  });
}

export const s3: S3Client = global.__qil_s3_client ?? buildClient();
if (process.env.NODE_ENV !== 'production') global.__qil_s3_client = s3;

/** Generate a unique S3 key for an order image. */
export function makeOrderImageKey(orderId: string, originalName: string, kind: string): string {
  const ext = originalName.includes('.') ? originalName.split('.').pop()!.toLowerCase() : 'bin';
  const safe = ext.replace(/[^a-z0-9]/g, '').slice(0, 5) || 'bin';
  const rand = randomBytes(6).toString('hex');
  return `orders/${orderId}/${kind}/${Date.now()}-${rand}.${safe}`;
}

/** Upload bytes to S3. */
export async function uploadToS3(opts: {
  key: string;
  body: Buffer | Uint8Array;
  contentType?: string;
}): Promise<void> {
  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: opts.key,
    Body: opts.body,
    ContentType: opts.contentType,
  }));
}

/** Generate a presigned GET URL (default 1 hour TTL). */
export async function presignGet(key: string, ttlSeconds = 3600): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), { expiresIn: ttlSeconds });
}

/** Delete an object. */
export async function deleteFromS3(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
}
