'use server';

import { revalidatePath } from 'next/cache';
import { createBranch } from '@/lib/db/branches';
import { query } from '@/lib/db';
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
      country: String(formData.get('country') ?? '').trim() || 'India',
      state: String(formData.get('state') ?? '').trim() || null,
      city: String(formData.get('city') ?? '').trim() || null,
      pincode: String(formData.get('pincode') ?? '').trim() || null,
      operatingCities: String(formData.get('operatingCities') ?? '').trim() || null,
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

export async function editBranchAction(formData: FormData): Promise<AddBranchResult> {
  await requireSession();
  const orgId = await currentOrgId();

  const id = String(formData.get('id') ?? '').trim();
  const code = String(formData.get('code') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const branchType = String(formData.get('branchType') ?? '').trim();

  if (!id) return { ok: false, error: 'Missing branch ID' };
  if (!code) return { ok: false, error: 'Branch code is required' };
  if (!name) return { ok: false, error: 'Branch name is required' };
  if (!['hub', 'branch', 'franchise', 'vendor'].includes(branchType)) {
    return { ok: false, error: 'Invalid branch type' };
  }

  const alias = String(formData.get('alias') ?? '').trim() || null;
  const email = String(formData.get('email') ?? '').trim() || null;
  const phone = String(formData.get('phone') ?? '').trim() || null;
  const addressLine = String(formData.get('addressLine') ?? '').trim() || null;
  const country = String(formData.get('country') ?? '').trim() || 'India';
  const state = String(formData.get('state') ?? '').trim() || null;
  const city = String(formData.get('city') ?? '').trim() || null;
  const pincode = String(formData.get('pincode') ?? '').trim() || null;
  const operatingCities = String(formData.get('operatingCities') ?? '').trim() || null;
  const headName = String(formData.get('headName') ?? '').trim() || null;
  const headEmail = String(formData.get('headEmail') ?? '').trim() || null;
  const headPhone = String(formData.get('headPhone') ?? '').trim() || null;

  try {
    await query(
      `update branches set
         code=$1, name=$2, alias=$3, branch_type=$4, email=$5, phone=$6,
         address_line=$7, state=$8, city=$9, pincode=$10,
         head_name=$11, head_email=$12, head_phone=$13,
         country=$16, operating_cities=$17
       where id=$14 and org_id=$15`,
      [code, name, alias, branchType, email, phone, addressLine, state, city, pincode, headName, headEmail, headPhone, id, orgId, country, operatingCities],
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('branches_code_per_org_uq')) return { ok: false, error: 'Another branch has this code' };
    return { ok: false, error: msg };
  }
  revalidatePath('/master/branches');
  return { ok: true };
}

export async function toggleBranchActiveAction(id: string, active: boolean): Promise<void> {
  await requireSession();
  await query(`update branches set is_active=$1 where id=$2 and org_id=$3`, [active, id, await currentOrgId()]);
  revalidatePath('/master/branches');
}
