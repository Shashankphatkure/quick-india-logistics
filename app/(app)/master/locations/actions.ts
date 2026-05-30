'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';

export type AddResult = { ok: true } | { ok: false; error: string };

export async function addLocationAction(formData: FormData): Promise<AddResult> {
  const session = await requireSession();
  const orgId = await currentOrgId();

  const country = String(formData.get('country') ?? '').trim() || 'India';
  const state = String(formData.get('state') ?? '').trim();
  const city = String(formData.get('city') ?? '').trim();
  const pincode = String(formData.get('pincode') ?? '').trim() || null;
  const assignedBranchId = String(formData.get('assignedBranchId') ?? '').trim() || null;

  if (!state) return { ok: false, error: 'State is required' };
  if (!city) return { ok: false, error: 'City is required' };

  try {
    await query(
      `insert into locations (org_id, country, state, city, pincode, assigned_branch_id, created_by, validated_by)
       values ($1, $2, $3, $4, $5, $6, $7, $7)`,
      [orgId, country, state, city, pincode, assignedBranchId, session.userId],
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    if (msg.includes('locations_uq')) return { ok: false, error: 'This city/state/pincode already exists' };
    return { ok: false, error: msg };
  }
  revalidatePath('/master/locations');
  return { ok: true };
}

export async function toggleLocationActiveAction(id: string, active: boolean): Promise<void> {
  await requireSession();
  await query(`update locations set is_active=$1 where id=$2 and org_id=$3`, [active, id, await currentOrgId()]);
  revalidatePath('/master/locations');
}
