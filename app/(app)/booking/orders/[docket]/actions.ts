'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { makeOrderImageKey, uploadToS3, S3_BUCKET, deleteFromS3 } from '@/lib/s3';
import { insertOrderImage, deleteOrderImage } from '@/lib/db/order-images';
import { one, query } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';

export type UploadImageResult = { ok: true; id: string } | { ok: false; error: string };

const ALLOWED_KINDS = new Set(['pod', 'pod_signature', 'pickup', 'delivery', 'damage', 'ewaybill', 'invoice', 'other']);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function uploadOrderImageAction(formData: FormData): Promise<UploadImageResult> {
  const session = await requireSession();
  const orgId = await currentOrgId();

  const orderId = String(formData.get('orderId') ?? '').trim();
  const kind = String(formData.get('kind') ?? '').trim();
  const caption = String(formData.get('caption') ?? '').trim() || null;
  const file = formData.get('file');

  if (!orderId) return { ok: false, error: 'Order ID required' };
  if (!ALLOWED_KINDS.has(kind)) return { ok: false, error: 'Invalid image kind' };
  if (!(file instanceof File)) return { ok: false, error: 'File required' };
  if (file.size === 0) return { ok: false, error: 'File is empty' };
  if (file.size > MAX_BYTES) return { ok: false, error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB)` };

  // Verify order exists in our org
  const order = await one<{ id: string; docket_no: string }>(
    `select id, docket_no from orders where id = $1 and org_id = $2`,
    [orderId, orgId],
  );
  if (!order) return { ok: false, error: 'Order not found' };

  const bytes = Buffer.from(await file.arrayBuffer());
  const key = makeOrderImageKey(orderId, file.name, kind);

  try {
    await uploadToS3({ key, body: bytes, contentType: file.type || undefined });
  } catch (e) {
    return { ok: false, error: `S3 upload failed: ${e instanceof Error ? e.message : String(e)}` };
  }

  let id: string;
  try {
    id = await insertOrderImage({
      orderId, kind, s3Key: key, s3Bucket: S3_BUCKET,
      contentType: file.type || null, sizeBytes: file.size, caption,
      uploadedBy: session.userId,
    });
  } catch (e) {
    await deleteFromS3(key).catch(() => undefined);
    return { ok: false, error: e instanceof Error ? e.message : 'DB insert failed' };
  }

  // Also set legacy single-image fields on the order for the most common kinds
  if (kind === 'pod') {
    await query(`update orders set pod_image_url = $1 where id = $2`, [key, orderId]);
  } else if (kind === 'pod_signature') {
    await query(`update orders set pod_signature_url = $1 where id = $2`, [key, orderId]);
  }

  revalidatePath(`/booking/orders/${order.docket_no}`);
  return { ok: true, id };
}

export async function deleteOrderImageAction(imageId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireSession();
  const row = await deleteOrderImage(imageId);
  if (!row) return { ok: false, error: 'Image not found' };
  await deleteFromS3(row.s3_key).catch(() => undefined);
  revalidatePath('/booking/orders');
  return { ok: true };
}
