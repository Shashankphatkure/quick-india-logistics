'use server';

import { revalidatePath } from 'next/cache';
import { createCommodity, setCommodityActive } from '@/lib/db/commodities';
import { currentOrgId } from '@/lib/tenant';
import { query } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export type AddCommodityResult = { ok: true } | { ok: false; error: string };

export async function addCommodityAction(formData: FormData): Promise<AddCommodityResult> {
  const name = String(formData.get('name') ?? '').trim();
  const typeId = String(formData.get('typeId') ?? '').trim();

  if (!name) return { ok: false, error: 'Commodity name is required' };
  if (!typeId) return { ok: false, error: 'Commodity type is required' };

  try {
    await createCommodity({ orgId: await currentOrgId(), typeId, name });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('commodities_name_per_org_uq')) {
      return { ok: false, error: 'A commodity with this name already exists' };
    }
    return { ok: false, error: msg };
  }

  revalidatePath('/master/commodities');
  return { ok: true };
}

export async function toggleCommodityActiveAction(id: string, active: boolean): Promise<void> {
  await requireSession();
  await setCommodityActive(id, active);
  revalidatePath('/master/commodities');
}

export type EditCommodityResult = { ok: true } | { ok: false; error: string };

export async function editCommodityAction(formData: FormData): Promise<EditCommodityResult> {
  await requireSession();
  const id = String(formData.get('id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const typeId = String(formData.get('typeId') ?? '').trim();
  if (!id) return { ok: false, error: 'Missing ID' };
  if (!name) return { ok: false, error: 'Name is required' };
  if (!typeId) return { ok: false, error: 'Type is required' };
  const orgId = await currentOrgId();
  try {
    await query(
      `update commodities set name = $1, type_id = $2 where id = $3 and org_id = $4`,
      [name, typeId, id, orgId],
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    if (msg.includes('commodities_name_per_org_uq')) return { ok: false, error: 'Another commodity has this name' };
    return { ok: false, error: msg };
  }
  revalidatePath('/master/commodities');
  return { ok: true };
}
