'use server';

import { revalidatePath } from 'next/cache';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';
import { updateEwaybillPartB } from '@/lib/db/ewaybill';

export type PartBResult = { ok: true } | { ok: false; error: string };

export async function updatePartBAction(formData: FormData): Promise<PartBResult> {
  await requireSession();
  const orgId = await currentOrgId();

  const orderId = String(formData.get('orderId') ?? '').trim();
  const vehicleNo = String(formData.get('vehicleNo') ?? '').trim().toUpperCase();
  const transporterName = String(formData.get('transporterName') ?? '').trim() || null;

  if (!orderId) return { ok: false, error: 'Missing order' };
  if (!vehicleNo) return { ok: false, error: 'Vehicle number is required for Part B' };

  try {
    const ok = await updateEwaybillPartB({ orgId, orderId, vehicleNo, transporterName });
    if (!ok) return { ok: false, error: 'Order not found or has no e-way bill' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
  revalidatePath('/ewaybill');
  return { ok: true };
}
