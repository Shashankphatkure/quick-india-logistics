'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';

export type UpdateOrgResult = { ok: true } | { ok: false; error: string };

export async function updateOrganizationAction(formData: FormData): Promise<UpdateOrgResult> {
  await requireSession();
  const orgId = await currentOrgId();
  const name = String(formData.get('name') ?? '').trim();
  const legalName = String(formData.get('legalName') ?? '').trim() || null;
  const pan = String(formData.get('pan') ?? '').trim() || null;
  const tan = String(formData.get('tan') ?? '').trim() || null;

  if (!name) return { ok: false, error: 'Organization name is required' };

  try {
    await query(
      `update organizations set name=$1, legal_name=$2, pan=$3, tan=$4 where id=$5`,
      [name, legalName, pan, tan, orgId],
    );
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Update failed' };
  }
  revalidatePath('/organization');
  return { ok: true };
}
