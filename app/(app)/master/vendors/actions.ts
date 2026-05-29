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

const SERVICE_REGIONS = new Set(['pan_india', 'state', 'city']);
const VENDOR_STATUSES = new Set(['approved', 'pending', 'rejected']);

export async function editVendorAction(formData: FormData): Promise<AddResult> {
  await requireSession();
  const orgId = await currentOrgId();

  const id = String(formData.get('id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const pan = String(formData.get('pan') ?? '').trim().toUpperCase() || null;
  const companyType = String(formData.get('companyType') ?? '').trim() || null;
  const serviceRegion = String(formData.get('serviceRegion') ?? '').trim();
  const lineOfBusiness = String(formData.get('lineOfBusiness') ?? '').trim() || null;
  const primaryEmail = String(formData.get('primaryEmail') ?? '').trim() || null;
  const primaryPhone = String(formData.get('primaryPhone') ?? '').trim() || null;
  const status = String(formData.get('status') ?? '').trim();

  if (!id) return { ok: false, error: 'Missing vendor ID' };
  if (!name) return { ok: false, error: 'Vendor name is required' };
  if (serviceRegion && !SERVICE_REGIONS.has(serviceRegion)) return { ok: false, error: 'Invalid service region' };
  if (!VENDOR_STATUSES.has(status)) return { ok: false, error: 'Invalid status' };

  try {
    await query(
      `update vendors set name=$1, pan=$2, company_type=$3, service_region=$4,
         line_of_business=$5, primary_email=$6, primary_phone=$7, status=$8
       where id=$9 and org_id=$10`,
      [name, pan, companyType, serviceRegion || null, lineOfBusiness, primaryEmail, primaryPhone, status, id, orgId],
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    if (msg.includes('vendors_name_per_org_uq')) return { ok: false, error: 'Another vendor has this name' };
    return { ok: false, error: msg };
  }
  revalidatePath('/master/vendors');
  return { ok: true };
}

export async function toggleVendorActiveAction(id: string, active: boolean): Promise<void> {
  await requireSession();
  await query(`update vendors set is_active=$1 where id=$2 and org_id=$3`, [active, id, await currentOrgId()]);
  revalidatePath('/master/vendors');
}
