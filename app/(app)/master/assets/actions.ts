'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';

export type AddResult = { ok: true } | { ok: false; error: string };

export async function addAssetAction(formData: FormData): Promise<AddResult> {
  const session = await requireSession();
  const orgId = await currentOrgId();

  const assetId = String(formData.get('assetId') ?? '').trim();
  const barcode = String(formData.get('barcode') ?? '').trim() || null;
  const kind = String(formData.get('assetKind') ?? '').trim();
  const loggerType = String(formData.get('loggerType') ?? '').trim() || null;
  const boxType = String(formData.get('boxType') ?? '').trim() || null;
  const capacityLiters = Number(formData.get('capacityLiters') ?? 0) || null;
  const manufacturer = String(formData.get('manufacturer') ?? '').trim() || null;
  const branchId = String(formData.get('branchId') ?? '').trim() || null;

  if (!assetId) return { ok: false, error: 'Asset ID is required' };
  if (!['logger', 'box'].includes(kind)) return { ok: false, error: 'Invalid asset kind' };

  try {
    await query(
      `insert into assets (
        org_id, asset_kind, asset_id, barcode,
        logger_type, box_type, capacity_liters, manufacturer,
        assigned_branch_id, current_branch_id, verified_by
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, $10)`,
      [orgId, kind, assetId, barcode, loggerType, boxType, capacityLiters, manufacturer, branchId, session.userId],
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    if (msg.includes('assets_id_per_org_uq')) return { ok: false, error: 'Asset ID already exists' };
    return { ok: false, error: msg };
  }
  revalidatePath('/master/assets');
  return { ok: true };
}

export async function editAssetAction(formData: FormData): Promise<AddResult> {
  await requireSession();
  const orgId = await currentOrgId();

  const id = String(formData.get('id') ?? '').trim();
  const assetId = String(formData.get('assetId') ?? '').trim();
  const barcode = String(formData.get('barcode') ?? '').trim() || null;
  const kind = String(formData.get('assetKind') ?? '').trim();
  const loggerType = kind === 'logger' ? (String(formData.get('loggerType') ?? '').trim() || null) : null;
  const boxType = kind === 'box' ? (String(formData.get('boxType') ?? '').trim() || null) : null;
  const capacityLiters = kind === 'box' ? (Number(formData.get('capacityLiters') ?? 0) || null) : null;
  const manufacturer = String(formData.get('manufacturer') ?? '').trim() || null;
  const branchId = String(formData.get('branchId') ?? '').trim() || null;

  if (!id) return { ok: false, error: 'Missing asset ID' };
  if (!assetId) return { ok: false, error: 'Asset ID is required' };
  if (!['logger', 'box'].includes(kind)) return { ok: false, error: 'Invalid asset kind' };

  try {
    await query(
      `update assets set
         asset_id=$1, barcode=$2, asset_kind=$3, logger_type=$4, box_type=$5,
         capacity_liters=$6, manufacturer=$7, current_branch_id=$8
       where id=$9 and org_id=$10`,
      [assetId, barcode, kind, loggerType, boxType, capacityLiters, manufacturer, branchId, id, orgId],
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    if (msg.includes('assets_id_per_org_uq')) return { ok: false, error: 'Another asset has this Asset ID' };
    return { ok: false, error: msg };
  }
  revalidatePath('/master/assets');
  return { ok: true };
}

export async function toggleAssetDefectiveAction(id: string, defective: boolean): Promise<void> {
  await requireSession();
  await query(`update assets set is_defective=$1 where id=$2 and org_id=$3`, [defective, id, await currentOrgId()]);
  revalidatePath('/master/assets');
}
