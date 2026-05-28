'use server';

import { revalidatePath } from 'next/cache';
import { createBranch } from '@/lib/db/branches';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';

export type AddBranchResult = { ok: true } | { ok: false; error: string };

export async function addBranchAction(formData: FormData): Promise<AddBranchResult> {
  const session = await requireSession();

  const code = String(formData.get('code') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const branchType = String(formData.get('branchType') ?? '').trim();

  if (!code) return { ok: false, error: 'Branch code is required' };
  if (!name) return { ok: false, error: 'Branch name is required' };
  if (!['hub', 'branch', 'franchise', 'vendor'].includes(branchType)) {
    return { ok: false, error: 'Invalid branch type' };
  }

  try {
    await createBranch({
      orgId: await currentOrgId(),
      code,
      name,
      alias: String(formData.get('alias') ?? '').trim() || null,
      branchType: branchType as 'hub' | 'branch' | 'franchise' | 'vendor',
      email: String(formData.get('email') ?? '').trim() || null,
      phone: String(formData.get('phone') ?? '').trim() || null,
      addressLine: String(formData.get('addressLine') ?? '').trim() || null,
      state: String(formData.get('state') ?? '').trim() || null,
      city: String(formData.get('city') ?? '').trim() || null,
      pincode: String(formData.get('pincode') ?? '').trim() || null,
      headName: String(formData.get('headName') ?? '').trim() || null,
      headEmail: String(formData.get('headEmail') ?? '').trim() || null,
      headPhone: String(formData.get('headPhone') ?? '').trim() || null,
      verifiedBy: session.userId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('branches_code_per_org_uq')) {
      return { ok: false, error: 'A branch with this code already exists' };
    }
    return { ok: false, error: msg };
  }

  revalidatePath('/master/branches');
  return { ok: true };
}
