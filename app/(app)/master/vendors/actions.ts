'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';

export type AddResult = { ok: true } | { ok: false; error: string };

export async function addVendorAction(formData: FormData): Promise<AddResult> {
  const session = await requireSession();
  const orgId = await currentOrgId();

  const name = String(formData.get('name') ?? '').trim();
  const pan = String(formData.get('pan') ?? '').trim().toUpperCase() || null;
  const companyType = String(formData.get('companyType') ?? '').trim() || null;
  const serviceRegion = String(formData.get('serviceRegion') ?? '').trim();
  const lineOfBusiness = String(formData.get('lineOfBusiness') ?? '').trim() || null;
  const primaryEmail = String(formData.get('primaryEmail') ?? '').trim() || null;
  const primaryPhone = String(formData.get('primaryPhone') ?? '').trim() || null;

  if (!name) return { ok: false, error: 'Vendor name is required' };
  if (serviceRegion && !['pan_india', 'state', 'city'].includes(serviceRegion)) {
    return { ok: false, error: 'Invalid service region' };
  }
  try {
    await query(
      `insert into vendors (org_id, name, pan, company_type, service_region, line_of_business, primary_email, primary_phone, status, verified_by)
       values ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)`,
      [orgId, name, pan, companyType, serviceRegion || null, lineOfBusiness, primaryEmail, primaryPhone, session.userId],
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    if (msg.includes('vendors_name_per_org_uq')) return { ok: false, error: 'Vendor already exists' };
    return { ok: false, error: msg };
  }
  revalidatePath('/master/vendors');
  return { ok: true };
}
