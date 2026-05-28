'use server';

import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';

export type CreateRunsheetResult = { ok: true; runsheetNo: string } | { ok: false; error: string };

export async function createRunsheetAction(formData: FormData): Promise<CreateRunsheetResult> {
  const session = await requireSession();
  const orgId = await currentOrgId();

  const branchId = String(formData.get('branchId') ?? '').trim();
  const route = String(formData.get('route') ?? '').trim() || null;
  const vehicleNo = String(formData.get('vehicleNo') ?? '').trim() || null;
  const driverName = String(formData.get('driverName') ?? '').trim() || null;
  const driverPhone = String(formData.get('driverPhone') ?? '').trim() || null;
  const orderIdsRaw = String(formData.get('orderIds') ?? '').trim();
  const orderIds = orderIdsRaw ? orderIdsRaw.split(',').filter(Boolean) : [];

  if (!branchId) return { ok: false, error: 'Branch is required' };
  if (orderIds.length === 0) return { ok: false, error: 'Select at least one order' };

  const runsheetNo = `RUN${Date.now().toString().slice(-7)}`;
  const client = await pool.connect();
  try {
    await client.query('begin');
    const r = await client.query(
      `insert into runsheets (org_id, runsheet_no, branch_id, route, vehicle_no, driver_name, driver_phone, state, created_by)
       values ($1,$2,$3,$4,$5,$6,$7,'out_for_delivery',$8) returning id`,
      [orgId, runsheetNo, branchId, route, vehicleNo, driverName, driverPhone, session.userId],
    );
    const runsheetId = r.rows[0].id;
    let seq = 1;
    for (const oid of orderIds) {
      await client.query(
        `insert into runsheet_orders (runsheet_id, order_id, sequence_no) values ($1, $2, $3) on conflict do nothing`,
        [runsheetId, oid, seq++],
      );
      await client.query(
        `update orders set status='out_for_delivery', current_branch_id=$2 where id=$1 and org_id=$3`,
        [oid, branchId, orgId],
      );
      await client.query(
        `insert into order_status_events (order_id, status, note, performed_by) values ($1, 'out_for_delivery', $2, $3)`,
        [oid, `Loaded on runsheet ${runsheetNo}`, session.userId],
      );
    }
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    return { ok: false, error: e instanceof Error ? e.message : 'Insert failed' };
  } finally {
    client.release();
  }

  revalidatePath('/runsheet/pending-delivery');
  revalidatePath('/runsheet/all');
  revalidatePath('/booking/orders');
  return { ok: true, runsheetNo };
}
