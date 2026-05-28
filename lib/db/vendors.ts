import 'server-only';
import { many, one } from '@/lib/db';

export type VendorRow = {
  id: string;
  name: string;
  pan: string | null;
  company_type: string | null;
  line_of_business: string | null;
  service_region: string | null;
  primary_email: string | null;
  primary_phone: string | null;
  status: string;
  is_active: boolean;
  verified_by_name: string | null;
};

const PAGE_SIZE_DEFAULT = 25;

export async function listVendors(opts: { orgId: string; search?: string; page?: number; pageSize?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, opts.pageSize ?? PAGE_SIZE_DEFAULT);
  return many<VendorRow>(
    `select v.id, v.name, v.pan, v.company_type, v.line_of_business, v.service_region,
            v.primary_email, v.primary_phone, v.status, v.is_active, u.full_name as verified_by_name
     from vendors v left join users u on u.id = v.verified_by
     where v.org_id = $1 and ($2::text is null or v.name ilike '%' || $2 || '%')
     order by v.name limit $3 offset $4`,
    [opts.orgId, opts.search ?? null, pageSize, (page - 1) * pageSize],
  );
}

export async function countVendors(opts: { orgId: string; search?: string }) {
  const r = await one<{ n: string }>(
    `select count(*)::text as n from vendors where org_id=$1 and ($2::text is null or name ilike '%' || $2 || '%')`,
    [opts.orgId, opts.search ?? null],
  );
  return Number(r?.n ?? 0);
}

export async function getVendorCounts(orgId: string) {
  const r = await one<{ total: string; approved: string; pending: string; pan_india: string }>(
    `select count(*)::text as total,
       count(*) filter (where status='approved')::text as approved,
       count(*) filter (where status='pending')::text as pending,
       count(*) filter (where service_region='pan_india')::text as pan_india
     from vendors where org_id=$1`,
    [orgId],
  );
  return {
    total: Number(r?.total ?? 0),
    approved: Number(r?.approved ?? 0),
    pending: Number(r?.pending ?? 0),
    pan_india: Number(r?.pan_india ?? 0),
  };
}
