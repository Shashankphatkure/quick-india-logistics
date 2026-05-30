import 'server-only';
import { many, one } from '@/lib/db';

export type LocationRow = {
  id: string;
  country: string;
  state: string;
  city: string;
  pincode: string | null;
  assigned_branch_name: string | null;
  in_use: boolean;
  is_active: boolean;
  created_by_name: string | null;
  validated_by_name: string | null;
};

const PAGE_SIZE = 25;

export async function listLocations(opts: { orgId: string; search?: string; page?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  return many<LocationRow>(
    `select l.id, l.country, l.state, l.city, l.pincode,
            b.name as assigned_branch_name,
            l.in_use, l.is_active,
            cu.full_name as created_by_name,
            vu.full_name as validated_by_name
     from locations l
     left join branches b on b.id = l.assigned_branch_id
     left join users cu on cu.id = l.created_by
     left join users vu on vu.id = l.validated_by
     where l.org_id = $1
       and ($2::text is null or l.city ilike '%' || $2 || '%' or l.state ilike '%' || $2 || '%' or l.pincode ilike '%' || $2 || '%')
     order by l.country, l.state, l.city
     limit $3 offset $4`,
    [opts.orgId, opts.search ?? null, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
}

export async function countLocations(opts: { orgId: string; search?: string }) {
  const r = await one<{ n: string }>(
    `select count(*)::text as n from locations
     where org_id = $1 and ($2::text is null or city ilike '%' || $2 || '%' or state ilike '%' || $2 || '%' or pincode ilike '%' || $2 || '%')`,
    [opts.orgId, opts.search ?? null],
  );
  return Number(r?.n ?? 0);
}

export async function getLocationCounts(orgId: string) {
  const r = await one<{ total: string; states: string; cities: string; pincodes: string }>(
    `select count(*)::text as total,
       count(distinct lower(state))::text as states,
       count(distinct lower(city))::text as cities,
       count(distinct pincode) filter (where pincode is not null)::text as pincodes
     from locations where org_id = $1`,
    [orgId],
  );
  return {
    total: Number(r?.total ?? 0),
    states: Number(r?.states ?? 0),
    cities: Number(r?.cities ?? 0),
    pincodes: Number(r?.pincodes ?? 0),
  };
}

export const LOCATION_PAGE_SIZE = PAGE_SIZE;
