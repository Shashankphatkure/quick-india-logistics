import 'server-only';
import { many, one, query } from '@/lib/db';

export type CommodityRow = {
  id: string;
  name: string;
  type_id: string;
  type_name: string;
  org_id: string;
  org_name: string;
  verified_by_name: string | null;
  is_active: boolean;
  expiry_days: number | null;
  created_at: string;
};

export type CommodityType = {
  id: string;
  name: string;
  perishable: boolean;
};

export type CommodityCounts = {
  total: number;
  active: number;
  perishable: number;
  expiry: number;
};

const LIST_SQL = `
  select
    c.id,
    c.name,
    c.type_id,
    t.name as type_name,
    c.org_id,
    o.name as org_name,
    u.full_name as verified_by_name,
    c.is_active,
    c.expiry_days,
    c.created_at
  from commodities c
  join commodity_types t on t.id = c.type_id
  join organizations o on o.id = c.org_id
  left join users u on u.id = c.verified_by
  where c.org_id = $1
    and ($2::text is null or c.name ilike '%' || $2 || '%')
  order by c.name
  limit $3 offset $4
`;

export async function listCommodities(opts: {
  orgId: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<CommodityRow[]> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, opts.pageSize ?? 25);
  return many<CommodityRow>(LIST_SQL, [
    opts.orgId,
    opts.search ?? null,
    pageSize,
    (page - 1) * pageSize,
  ]);
}

export async function countCommodities(opts: {
  orgId: string;
  search?: string;
}): Promise<number> {
  const r = await one<{ n: string }>(
    `select count(*)::text as n from commodities
     where org_id = $1 and ($2::text is null or name ilike '%' || $2 || '%')`,
    [opts.orgId, opts.search ?? null],
  );
  return Number(r?.n ?? 0);
}

export async function getCommodityCounts(orgId: string): Promise<CommodityCounts> {
  const r = await one<{ total: string; active: string; perishable: string; expiry: string }>(
    `select
       count(*)::text as total,
       count(*) filter (where c.is_active)::text as active,
       count(*) filter (where t.name = 'Perishable Food')::text as perishable,
       count(*) filter (where t.name = 'Expiry Goods')::text as expiry
     from commodities c
     join commodity_types t on t.id = c.type_id
     where c.org_id = $1`,
    [orgId],
  );
  return {
    total: Number(r?.total ?? 0),
    active: Number(r?.active ?? 0),
    perishable: Number(r?.perishable ?? 0),
    expiry: Number(r?.expiry ?? 0),
  };
}

export async function listCommodityTypes(orgId: string): Promise<CommodityType[]> {
  return many<CommodityType>(
    `select id, name, (name ~* 'perish|expiry') as perishable
     from commodity_types where org_id = $1 and is_active order by name`,
    [orgId],
  );
}

export async function createCommodity(input: {
  orgId: string;
  typeId: string;
  name: string;
  expiryDays?: number | null;
  verifiedBy?: string | null;
}): Promise<string> {
  const r = await one<{ id: string }>(
    `insert into commodities (org_id, type_id, name, expiry_days, verified_by)
     values ($1, $2, $3, $4, $5)
     returning id`,
    [input.orgId, input.typeId, input.name.trim(), input.expiryDays ?? null, input.verifiedBy ?? null],
  );
  if (!r) throw new Error('Insert failed');
  return r.id;
}

export async function setCommodityActive(id: string, active: boolean): Promise<void> {
  await query(`update commodities set is_active = $2 where id = $1`, [id, active]);
}
