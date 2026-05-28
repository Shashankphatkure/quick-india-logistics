'use server';

import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';

export type MarkDepartedResult = { ok: true } | { ok: false; error: string };

export async function markManifestDepartedAction(formData: FormData): Promise<MarkDepartedResult> {
  const session = await requireSession();
  const orgId = await currentOrgId();
  const manifestId = String(formData.get('manifestId') ?? '').trim();
  if (!manifestId) return { ok: false, error: 'Manifest ID required' };

  const client = await pool.connect();
  try {
    await client.query('begin');
    const r = await client.query(
      `update manifests set state='departed', departed_at=now() where id=$1 and org_id=$2 and state='final' returning id`,
      [manifestId, orgId],
    );
    if (r.rowCount === 0) {
      await client.query('rollback');
      return { ok: false, error: 'Manifest not in final state or not found' };
    }
    // Update all linked orders to 'departed'
    await client.query(
      `update orders set status='departed' where id in (
        select order_id from manifest_orders where manifest_id=$1
      ) and org_id=$2`,
      [manifestId, orgId],
    );
    await client.query(
      `insert into order_status_events (order_id, status, note, performed_by)
       select order_id, 'departed', 'Manifest departed', $2 from manifest_orders where manifest_id=$1`,
      [manifestId, session.userId],
    );
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  } finally {
    client.release();
  }

  revalidatePath('/manifest/pending-depart');
  revalidatePath('/manifest/all');
  revalidatePath('/manifest/incoming');
  revalidatePath('/booking/orders');
  return { ok: true };
}
