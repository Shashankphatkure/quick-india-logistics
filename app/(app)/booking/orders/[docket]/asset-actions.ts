'use server';

import { revalidatePath } from 'next/cache';
import { pool, one } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';

export type AttachResult = { ok: true } | { ok: false; error: string };

export async function attachOrderAssetAction(formData: FormData): Promise<AttachResult> {
  const session = await requireSession();
  const orgId = await currentOrgId();
  const orderId = String(formData.get('orderId') ?? '').trim();
  const assetId = String(formData.get('assetId') ?? '').trim();
  if (!orderId) return { ok: false, error: 'Order required' };
  if (!assetId) return { ok: false, error: 'Asset required' };

  const order = await one<{ id: string; docket_no: string; current_branch_id: string | null }>(
    `select id, docket_no, current_branch_id from orders where id=$1 and org_id=$2`,
    [orderId, orgId],
  );
  if (!order) return { ok: false, error: 'Order not found' };

  const asset = await one<{ id: string; asset_id: string; asset_kind: string; in_use: boolean }>(
    `select id, asset_id, asset_kind, in_use from assets where id=$1 and org_id=$2`,
    [assetId, orgId],
  );
  if (!asset) return { ok: false, error: 'Asset not found' };
  if (asset.in_use) return { ok: false, error: 'Asset is already in use on another order' };

  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(
      `insert into order_assets (order_id, asset_kind, asset_label, asset_id) values ($1, $2, $3, $4)`,
      [orderId, asset.asset_kind, asset.asset_id, asset.id],
    );
    await client.query(
      `update assets set in_use = true, usage_count = usage_count + 1, current_branch_id = coalesce($2, current_branch_id) where id = $1`,
      [asset.id, order.current_branch_id],
    );
    await client.query(
      `insert into asset_movements (asset_id, from_branch_id, to_branch_id, order_id, performed_by)
       select $1, current_branch_id, $2, $3, $4 from assets where id = $1`,
      [asset.id, order.current_branch_id, orderId, session.userId],
    );
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    return { ok: false, error: e instanceof Error ? e.message : 'Insert failed' };
  } finally {
    client.release();
  }

  revalidatePath(`/booking/orders/${order.docket_no}`);
  revalidatePath('/master/assets');
  return { ok: true };
}

export async function detachOrderAssetAction(orderAssetId: string): Promise<AttachResult> {
  await requireSession();
  const client = await pool.connect();
  try {
    await client.query('begin');
    const r = await client.query(
      `update order_assets set detached_at = now() where id = $1 and detached_at is null returning order_id, asset_id`,
      [orderAssetId],
    );
    if (r.rowCount === 0) {
      await client.query('rollback');
      return { ok: false, error: 'Already detached or not found' };
    }
    if (r.rows[0].asset_id) {
      await client.query(`update assets set in_use = false where id = $1`, [r.rows[0].asset_id]);
    }
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    return { ok: false, error: e instanceof Error ? e.message : 'Detach failed' };
  } finally {
    client.release();
  }
  revalidatePath('/booking/orders');
  revalidatePath('/master/assets');
  return { ok: true };
}
