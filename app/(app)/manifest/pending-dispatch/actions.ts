'use server';

import { revalidatePath } from 'next/cache';
import { query, one, pool } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';

export type CreateManifestResult = { ok: true; manifestNo: string } | { ok: false; error: string };

const MODES = new Set(['local', 'air', 'surface', 'cargo', 'train', 'courier', 'warehouse', 'hub_transfer']);

export async function createManifestAction(formData: FormData): Promise<CreateManifestResult> {
  const session = await requireSession();
  const orgId = await currentOrgId();

  const fromBranchId = String(formData.get('fromBranchId') ?? '').trim();
  const toBranchId = String(formData.get('toBranchId') ?? '').trim();
  const mode = String(formData.get('mode') ?? '').trim();
  const vendorId = String(formData.get('vendorId') ?? '').trim() || null;
  const vehicleNo = String(formData.get('vehicleNo') ?? '').trim() || null;
  const airwayBillNo = String(formData.get('airwayBillNo') ?? '').trim() || null;
  const orderIdsRaw = String(formData.get('orderIds') ?? '').trim();
  const orderIds = orderIdsRaw ? orderIdsRaw.split(',').filter(Boolean) : [];

  if (!fromBranchId) return { ok: false, error: 'From Branch is required' };
  if (!toBranchId) return { ok: false, error: 'To Branch is required' };
  if (fromBranchId === toBranchId) return { ok: false, error: 'From and To Branch must differ' };
  if (!MODES.has(mode)) return { ok: false, error: 'Invalid mode' };
  if (orderIds.length === 0) return { ok: false, error: 'Select at least one order' };
  if (mode === 'air' && !airwayBillNo) return { ok: false, error: 'Airway Bill No is required for Air mode' };
  if (mode !== 'air' && mode !== 'hub_transfer' && !vehicleNo) return { ok: false, error: 'Vehicle No required for non-air modes' };

  const manifestNo = `MAN${Date.now().toString().slice(-7)}`;

  const client = await pool.connect();
  try {
    await client.query('begin');

    const ins = await client.query(
      `insert into manifests (
        org_id, manifest_no, from_branch_id, to_branch_id, manifest_date,
        mode, vendor_id, airway_bill_no, vehicle_no, state, created_by
      ) values ($1,$2,$3,$4,current_date,$5,$6,$7,$8,'final',$9) returning id`,
      [orgId, manifestNo, fromBranchId, toBranchId, mode, vendorId, airwayBillNo, vehicleNo, session.userId],
    );
    const manifestId = ins.rows[0].id;

    // Link orders + update status
    for (const oid of orderIds) {
      await client.query(
        `insert into manifest_orders (manifest_id, order_id) values ($1, $2) on conflict do nothing`,
        [manifestId, oid],
      );
      await client.query(
        `update orders set status = 'connected', current_branch_id = $2 where id = $1 and org_id = $3`,
        [oid, fromBranchId, orgId],
      );
      await client.query(
        `insert into order_status_events (order_id, status, note, performed_by)
         values ($1, 'connected', $2, $3)`,
        [oid, `Connected to manifest ${manifestNo}`, session.userId],
      );
    }

    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    return { ok: false, error: e instanceof Error ? e.message : 'Insert failed' };
  } finally {
    client.release();
  }

  revalidatePath('/manifest/pending-dispatch');
  revalidatePath('/manifest/all');
  revalidatePath('/manifest/forwarding');
  revalidatePath('/booking/orders');
  return { ok: true, manifestNo };
}
