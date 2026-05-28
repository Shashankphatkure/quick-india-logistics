import 'server-only';
import { many, one, query } from '@/lib/db';

export type OrderImageRow = {
  id: string;
  order_id: string;
  kind: string;
  s3_key: string;
  s3_bucket: string;
  content_type: string | null;
  size_bytes: string | null;
  caption: string | null;
  uploaded_by_name: string | null;
  uploaded_at: string;
};

export async function listOrderImages(orderId: string): Promise<OrderImageRow[]> {
  return many<OrderImageRow>(
    `select oi.id, oi.order_id, oi.kind, oi.s3_key, oi.s3_bucket,
            oi.content_type, oi.size_bytes::text, oi.caption,
            u.full_name as uploaded_by_name,
            to_char(oi.uploaded_at, 'DD-MM-YYYY HH24:MI') as uploaded_at
     from order_images oi
     left join users u on u.id = oi.uploaded_by
     where oi.order_id = $1
     order by oi.uploaded_at desc`,
    [orderId],
  );
}

export async function insertOrderImage(input: {
  orderId: string;
  kind: string;
  s3Key: string;
  s3Bucket: string;
  contentType: string | null;
  sizeBytes: number;
  caption: string | null;
  uploadedBy: string;
}): Promise<string> {
  const r = await one<{ id: string }>(
    `insert into order_images (
      order_id, kind, s3_key, s3_bucket, content_type, size_bytes, caption, uploaded_by
     ) values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`,
    [
      input.orderId, input.kind, input.s3Key, input.s3Bucket,
      input.contentType, input.sizeBytes, input.caption, input.uploadedBy,
    ],
  );
  if (!r) throw new Error('Image insert failed');
  return r.id;
}

export async function deleteOrderImage(imageId: string): Promise<{ s3_key: string } | null> {
  const r = await one<{ s3_key: string }>(
    `delete from order_images where id = $1 returning s3_key`,
    [imageId],
  );
  return r ?? null;
}
