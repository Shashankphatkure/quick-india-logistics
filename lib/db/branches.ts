import 'server-only';
import { many, one, query } from '@/lib/db';

export type BranchRow = {
  id: string;
  code: string;
  name: string;
  alias: string | null;
  branch_type: string;
  vendor_mode: string | null;
  email: string | null;
  phone: string | null;
  address_line: string | null;
  state: string | null;
  city: string | null;
  pincode: string | null;
  head_name: string | null;
  head_email: string | null;
  head_phone: string | null;
  verified_by_name: string | null;
  is_active: boolean;
};

export type BranchCounts = {
  total: number;
  active: number;
  hubs: number;
  franchises: number;
  vendors: number;
};

export async function listBranches(opts: {
  orgId: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<BranchRow[]> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, opts.pageSize ?? 25);
  return many<BranchRow>(
    `select
       b.id, b.code, b.name, b.alias, b.branch_type, b.vendor_mode,
       b.email, b.phone, b.address_line, b.state, b.city, b.pincode,
       b.head_name, b.head_email, b.head_phone,
       u.full_name as verified_by_name,
       b.is_active
     from branches b
     left join users u on u.id = b.verified_by
     where b.org_id = $1
       and ($2::text is null or b.name ilike '%' || $2 || '%' or b.code ilike '%' || $2 || '%')
     order by b.name
     limit $3 offset $4`,
    [opts.orgId, opts.search ?? null, pageSize, (page - 1) * pageSize],
  );
}

export async function countBranches(opts: { orgId: string; search?: string }): Promise<number> {
  const r = await one<{ n: string }>(
    `select count(*)::text as n from branches
     where org_id = $1 and ($2::text is null or name ilike '%' || $2 || '%' or code ilike '%' || $2 || '%')`,
    [opts.orgId, opts.search ?? null],
  );
  return Number(r?.n ?? 0);
}

export async function getBranchCounts(orgId: string): Promise<BranchCounts> {
  const r = await one<{
    total: string;
    active: string;
    hubs: string;
    franchises: string;
    vendors: string;
  }>(
    `select
       count(*)::text as total,
       count(*) filter (where is_active)::text as active,
       count(*) filter (where branch_type = 'hub')::text as hubs,
       count(*) filter (where branch_type = 'franchise')::text as franchises,
       count(*) filter (where branch_type = 'vendor')::text as vendors
     from branches where org_id = $1`,
    [orgId],
  );
  return {
    total: Number(r?.total ?? 0),
    active: Number(r?.active ?? 0),
    hubs: Number(r?.hubs ?? 0),
    franchises: Number(r?.franchises ?? 0),
    vendors: Number(r?.vendors ?? 0),
  };
}

export type CreateBranchInput = {
  orgId: string;
  code: string;
  name: string;
  alias?: string | null;
  branchType: 'hub' | 'branch' | 'franchise' | 'vendor';
  email?: string | null;
  phone?: string | null;
  addressLine?: string | null;
  state?: string | null;
  city?: string | null;
  pincode?: string | null;
  headName?: string | null;
  headEmail?: string | null;
  headPhone?: string | null;
  verifiedBy?: string | null;
};

export async function createBranch(input: CreateBranchInput): Promise<string> {
  const r = await one<{ id: string }>(
    `insert into branches (
       org_id, code, name, alias, branch_type,
       email, phone, address_line, state, city, pincode,
       head_name, head_email, head_phone, verified_by
     ) values (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9, $10, $11,
       $12, $13, $14, $15
     ) returning id`,
    [
      input.orgId,
      input.code.trim(),
      input.name.trim(),
      input.alias ?? null,
      input.branchType,
      input.email ?? null,
      input.phone ?? null,
      input.addressLine ?? null,
      input.state ?? null,
      input.city ?? null,
      input.pincode ?? null,
      input.headName ?? null,
      input.headEmail ?? null,
      input.headPhone ?? null,
      input.verifiedBy ?? null,
    ],
  );
  if (!r) throw new Error('Insert failed');
  return r.id;
}

export async function listBranchesForSelect(orgId: string): Promise<{ id: string; name: string }[]> {
  return many<{ id: string; name: string }>(
    `select id, name from branches where org_id = $1 and is_active order by name`,
    [orgId],
  );
}
