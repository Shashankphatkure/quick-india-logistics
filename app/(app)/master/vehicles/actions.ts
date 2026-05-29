'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';

export type AddResult = { ok: true } | { ok: false; error: string };

export async function addVehicleAction(formData: FormData): Promise<AddResult> {
  await requireSession();
  const orgId = await currentOrgId();

  const number = String(formData.get('number') ?? '').trim().toUpperCase();
  const vehicleType = String(formData.get('vehicleType') ?? '').trim();
  const ownerType = String(formData.get('ownerType') ?? '').trim();
  const model = String(formData.get('model') ?? '').trim() || null;
  const capacityKg = Number(formData.get('capacityKg') ?? 0) || null;

  if (!number) return { ok: false, error: 'Vehicle number is required' };
  if (!['truck', 'van', 'bike', 'tempo', 'mini_truck'].includes(vehicleType)) return { ok: false, error: 'Invalid vehicle type' };
  if (!['owned', 'partner', 'market'].includes(ownerType)) return { ok: false, error: 'Invalid owner type' };

  try {
    await query(
      `insert into vehicles (org_id, number, vehicle_type, owner_type, model, capacity_kg)
       values ($1, $2, $3, $4, $5, $6)`,
      [orgId, number, vehicleType, ownerType, model, capacityKg],
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    if (msg.includes('vehicles_number_per_org_uq')) return { ok: false, error: 'Vehicle number already exists' };
    return { ok: false, error: msg };
  }
  revalidatePath('/master/vehicles');
  return { ok: true };
}

const VEHICLE_TYPES = new Set(['truck', 'van', 'bike', 'tempo', 'mini_truck']);
const OWNER_TYPES = new Set(['owned', 'partner', 'market']);

export async function editVehicleAction(formData: FormData): Promise<AddResult> {
  await requireSession();
  const orgId = await currentOrgId();

  const id = String(formData.get('id') ?? '').trim();
  const number = String(formData.get('number') ?? '').trim().toUpperCase();
  const vehicleType = String(formData.get('vehicleType') ?? '').trim();
  const ownerType = String(formData.get('ownerType') ?? '').trim();
  const model = String(formData.get('model') ?? '').trim() || null;
  const capacityKg = Number(formData.get('capacityKg') ?? 0) || null;

  if (!id) return { ok: false, error: 'Missing vehicle ID' };
  if (!number) return { ok: false, error: 'Vehicle number is required' };
  if (!VEHICLE_TYPES.has(vehicleType)) return { ok: false, error: 'Invalid vehicle type' };
  if (!OWNER_TYPES.has(ownerType)) return { ok: false, error: 'Invalid owner type' };

  try {
    await query(
      `update vehicles set number=$1, vehicle_type=$2, owner_type=$3, model=$4, capacity_kg=$5
       where id=$6 and org_id=$7`,
      [number, vehicleType, ownerType, model, capacityKg, id, orgId],
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    if (msg.includes('vehicles_number_per_org_uq')) return { ok: false, error: 'Vehicle number already exists' };
    return { ok: false, error: msg };
  }
  revalidatePath('/master/vehicles');
  return { ok: true };
}

export async function toggleVehicleActiveAction(id: string, active: boolean): Promise<void> {
  await requireSession();
  await query(`update vehicles set is_active=$1 where id=$2 and org_id=$3`, [active, id, await currentOrgId()]);
  revalidatePath('/master/vehicles');
}
