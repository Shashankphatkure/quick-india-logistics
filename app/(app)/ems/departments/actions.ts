'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';

export type AddResult = { ok: true } | { ok: false; error: string };

export async function addDepartmentAction(formData: FormData): Promise<AddResult> {
  await requireSession();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { ok: false, error: 'Name is required' };
  try {
    await query(`insert into departments (org_id, name) values ($1, $2)`, [await currentOrgId(), name]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    if (msg.includes('departments_name_per_org_uq')) return { ok: false, error: 'Department already exists' };
    return { ok: false, error: msg };
  }
  revalidatePath('/ems/departments');
  return { ok: true };
}

export async function addDesignationAction(formData: FormData): Promise<AddResult> {
  await requireSession();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { ok: false, error: 'Name is required' };
  try {
    await query(`insert into designations (org_id, name) values ($1, $2)`, [await currentOrgId(), name]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    if (msg.includes('designations_name_per_org_uq')) return { ok: false, error: 'Designation already exists' };
    return { ok: false, error: msg };
  }
  revalidatePath('/ems/designations');
  return { ok: true };
}
