'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { currentOrgId } from '@/lib/tenant';
import { one, pool } from '@/lib/db';
import { uploadToS3, makeOrderImageKey, S3_BUCKET, deleteFromS3 } from '@/lib/s3';
import { STATUS_TRANSITIONS, nextLockState, canAdvanceLockState, lockStateLabel } from '@/lib/order-status';

export type StatusResult = { ok: true } | { ok: false; error: string };

/** Advance an order's maker-checker lock_state to the next stage, with role-gating + audit log. */
export async function advanceLockStateAction(formData: FormData): Promise<StatusResult> {
  const session = await requireSession();
  const orgId = await currentOrgId();

  const orderId = String(formData.get('orderId') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim() || null;
  if (!orderId) return { ok: false, error: 'Order required' };

  const order = await one<{ id: string; docket_no: string; lock_state: string }>(
    `select id, docket_no, lock_state from orders where id=$1 and org_id=$2`,
    [orderId, orgId],
  );
  if (!order) return { ok: false, error: 'Order not found' };

  const next = nextLockState(order.lock_state);
  if (!next) return { ok: false, error: 'Order is already fully locked' };
  if (!canAdvanceLockState(session.userType ?? '', order.lock_state)) {
    return { ok: false, error: `Your role cannot advance to ${lockStateLabel(next)}` };
  }

  const client = await pool.connect();
  try {
    await client.query('begin');
    // Guard against concurrent advancement: only update if still in the expected state.
    const u = await client.query(
      `update orders set lock_state=$1, updated_at=now() where id=$2 and org_id=$3 and lock_state=$4`,
      [next, orderId, orgId, order.lock_state],
    );
    if ((u.rowCount ?? 0) === 0) {
      await client.query('rollback');
      return { ok: false, error: 'Lock state changed concurrently — refresh and retry' };
    }
    await client.query(
      `insert into order_lock_events (order_id, from_state, to_state, performed_by, note)
       values ($1, $2, $3, $4, $5)`,
      [orderId, order.lock_state, next, session.userId, note],
    );
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    return { ok: false, error: e instanceof Error ? e.message : 'Lock advance failed' };
  } finally {
    client.release();
  }

  revalidatePath(`/booking/orders/${order.docket_no}`);
  revalidatePath('/booking/orders');
  return { ok: true };
}

const MAX_BYTES = 8 * 1024 * 1024;

/** Advance an order to a non-delivered status (delivered must use markDeliveredAction). */
export async function advanceOrderStatusAction(formData: FormData): Promise<StatusResult> {
  const session = await requireSession();
  const orgId = await currentOrgId();

  const orderId = String(formData.get('orderId') ?? '').trim();
  const newStatus = String(formData.get('status') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim() || null;
  const vehicleNo = String(formData.get('vehicleNo') ?? '').trim() || null;
  const location = String(formData.get('location') ?? '').trim() || null;

  if (!orderId) return { ok: false, error: 'Order required' };
  if (!newStatus) return { ok: false, error: 'New status required' };
  if (newStatus === 'delivered') return { ok: false, error: 'Use Mark Delivered to capture proof of delivery' };

  const order = await one<{ id: string; docket_no: string; status: string }>(
    `select id, docket_no, status from orders where id=$1 and org_id=$2`,
    [orderId, orgId],
  );
  if (!order) return { ok: false, error: 'Order not found' };

  const allowed = STATUS_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(newStatus as never)) {
    return { ok: false, error: `Cannot move from "${order.status}" to "${newStatus}"` };
  }

  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(`update orders set status=$1 where id=$2 and org_id=$3`, [newStatus, orderId, orgId]);
    await client.query(
      `insert into order_status_events (order_id, status, note, vehicle_no, location, performed_by)
       values ($1, $2, $3, $4, $5, $6)`,
      [orderId, newStatus, note, vehicleNo, location, session.userId],
    );
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    return { ok: false, error: e instanceof Error ? e.message : 'Update failed' };
  } finally {
    client.release();
  }

  revalidatePath(`/booking/orders/${order.docket_no}`);
  revalidatePath('/booking/orders');
  revalidatePath('/booking/delivery-info');
  return { ok: true };
}

/** Mark an order delivered: capture recipient + optional POD image atomically. */
export async function markDeliveredAction(formData: FormData): Promise<StatusResult> {
  const session = await requireSession();
  const orgId = await currentOrgId();

  const orderId = String(formData.get('orderId') ?? '').trim();
  const recipientName = String(formData.get('recipientName') ?? '').trim();
  const recipientPhone = String(formData.get('recipientPhone') ?? '').trim() || null;
  const note = String(formData.get('note') ?? '').trim() || null;
  const file = formData.get('pod');

  if (!orderId) return { ok: false, error: 'Order required' };
  if (!recipientName) return { ok: false, error: 'Recipient name is required' };

  const order = await one<{ id: string; docket_no: string; status: string }>(
    `select id, docket_no, status from orders where id=$1 and org_id=$2`,
    [orderId, orgId],
  );
  if (!order) return { ok: false, error: 'Order not found' };
  if (!['out_for_delivery', 'arrived_at_destination', 'not_received'].includes(order.status)) {
    return { ok: false, error: `Cannot deliver an order in "${order.status}"` };
  }

  // Upload POD to S3 first (outside the txn — S3 isn't transactional).
  let podKey: string | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) return { ok: false, error: 'POD image too large (max 8 MB)' };
    const bytes = Buffer.from(await file.arrayBuffer());
    podKey = makeOrderImageKey(orderId, file.name, 'pod');
    try {
      await uploadToS3({ key: podKey, body: bytes, contentType: file.type || undefined });
    } catch (e) {
      return { ok: false, error: `POD upload failed: ${e instanceof Error ? e.message : String(e)}` };
    }
  }

  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(
      `update orders set status='delivered', delivered_at=now(),
         pod_recipient_name=$1, pod_recipient_phone=$2,
         pod_image_url=coalesce($3, pod_image_url)
       where id=$4 and org_id=$5`,
      [recipientName, recipientPhone, podKey, orderId, orgId],
    );
    await client.query(
      `insert into order_status_events (order_id, status, note, performed_by)
       values ($1, 'delivered', $2, $3)`,
      [orderId, note ?? `Delivered to ${recipientName}`, session.userId],
    );
    if (podKey) {
      await client.query(
        `insert into order_images (order_id, kind, s3_key, s3_bucket, content_type, caption, uploaded_by)
         values ($1, 'pod', $2, $3, $4, $5, $6)`,
        [orderId, podKey, S3_BUCKET, (file as File).type || null, `POD — ${recipientName}`, session.userId],
      );
    }
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    if (podKey) await deleteFromS3(podKey).catch(() => undefined);
    return { ok: false, error: e instanceof Error ? e.message : 'Delivery update failed' };
  } finally {
    client.release();
  }

  revalidatePath(`/booking/orders/${order.docket_no}`);
  revalidatePath('/booking/orders');
  revalidatePath('/booking/delivery-info');
  return { ok: true };
}
