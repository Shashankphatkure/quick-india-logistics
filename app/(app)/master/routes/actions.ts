'use server';

import { revalidatePath } from 'next/cache';
import { query, one } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';

export type RouteResult = { ok: true } | { ok: false; error: string };

const MODES = new Set(['local', 'air', 'surface', 'cargo', 'train', 'courier', 'warehouse']);

export async function addRouteAction(formData: FormData): Promise<RouteResult> {
  await requireSession();
  const orgId = await currentOrgId();

  const clientId = String(formData.get('clientId') ?? '').trim();
  const mode = String(formData.get('mode') ?? '').trim();
  const originBranchId = String(formData.get('originBranchId') ?? '').trim();
  const destinationBranchId = String(formData.get('destinationBranchId') ?? '').trim();
  const tatHours = Number(formData.get('tatHours') ?? 0);
  const ratePerKg = Number(formData.get('ratePerKg') ?? 0) || null;

  if (!clientId) return { ok: false, error: 'Client is required' };
  if (!MODES.has(mode)) return { ok: false, error: 'Invalid mode' };
  if (!originBranchId || !destinationBranchId) return { ok: false, error: 'Origin and destination are required' };
  if (originBranchId === destinationBranchId) return { ok: false, error: 'Origin and destination must differ' };
  if (!(tatHours > 0)) return { ok: false, error: 'TAT hours must be greater than 0' };

  // Confirm the client belongs to this org (tat_routes has no org_id of its own).
  const owns = await one<{ id: string }>(
    `select c.id from clients c join bill_to bt on bt.id = c.bill_to_id
     where c.id = $1 and bt.org_id = $2`,
    [clientId, orgId],
  );
  if (!owns) return { ok: false, error: 'Client not found in your organization' };

  try {
    await query(
      `insert into tat_routes (client_id, mode, origin_branch_id, destination_branch_id, tat_hours, rate_per_kg)
       values ($1, $2, $3, $4, $5, $6)`,
      [clientId, mode, originBranchId, destinationBranchId, tatHours, ratePerKg],
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    if (msg.includes('tat_routes_uq')) return { ok: false, error: 'A route for this client / mode / origin / destination already exists' };
    return { ok: false, error: msg };
  }
  revalidatePath('/master/routes');
  return { ok: true };
}

export async function removeRouteAction(id: string): Promise<RouteResult> {
  await requireSession();
  if (!id) return { ok: false, error: 'Missing route ID' };
  const orgId = await currentOrgId();
  try {
    await query(
      `delete from tat_routes t
       using clients c, bill_to bt
       where t.id = $1 and c.id = t.client_id and bt.id = c.bill_to_id and bt.org_id = $2`,
      [id, orgId],
    );
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
  revalidatePath('/master/routes');
  return { ok: true };
}
