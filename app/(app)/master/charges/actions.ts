'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';

export type ChargeResult = { ok: true } | { ok: false; error: string };

const CHARGE_TYPES = new Set(['percent', 'flat', 'per_kg', 'per_box']);

export async function addChargeAction(formData: FormData): Promise<ChargeResult> {
  await requireSession();
  const orgId = await currentOrgId();

  const code = String(formData.get('code') ?? '').trim().toUpperCase();
  const label = String(formData.get('label') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const chargeType = String(formData.get('chargeType') ?? '').trim();
  const defaultValue = Number(formData.get('defaultValue') ?? 0) || 0;
  const appliesTo = String(formData.get('appliesTo') ?? '').trim() || null;

  if (!code) return { ok: false, error: 'Charge code is required' };
  if (!label) return { ok: false, error: 'Charge name is required' };
  if (!CHARGE_TYPES.has(chargeType)) return { ok: false, error: 'Invalid charge type' };

  try {
    await query(
      `insert into charges (org_id, code, label, description, charge_type, default_value, applies_to)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [orgId, code, label, description, chargeType, defaultValue, appliesTo],
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    if (msg.includes('charges_code_per_org_uq')) return { ok: false, error: 'A charge with this code already exists' };
    return { ok: false, error: msg };
  }
  revalidatePath('/master/charges');
  return { ok: true };
}

export async function removeChargeAction(id: string): Promise<ChargeResult> {
  await requireSession();
  if (!id) return { ok: false, error: 'Missing charge ID' };
  try {
    await query(`update charges set is_active = false where id = $1 and org_id = $2`, [id, await currentOrgId()]);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
  revalidatePath('/master/charges');
  return { ok: true };
}
