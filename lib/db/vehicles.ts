import 'server-only';
import { many, one } from '@/lib/db';

export type VehicleRow = {
  id: string;
  number: string;
  vehicle_type: string | null;
  owner_type: string | null;
  model: string | null;
  capacity_kg: string | null;
  is_active: boolean;
};

const PAGE_SIZE = 25;

export async function listVehicles(opts: { orgId: string; search?: string; page?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  return many<VehicleRow>(
    `select id, number, vehicle_type, owner_type, model, capacity_kg::text, is_active
     from vehicles
     where org_id=$1 and ($2::text is null or number ilike '%' || $2 || '%' or model ilike '%' || $2 || '%')
     order by number
     limit $3 offset $4`,
    [opts.orgId, opts.search ?? null, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
}

export async function countVehicles(opts: { orgId: string; search?: string }) {
  const r = await one<{ n: string }>(
    `select count(*)::text as n from vehicles where org_id=$1
     and ($2::text is null or number ilike '%' || $2 || '%' or model ilike '%' || $2 || '%')`,
    [opts.orgId, opts.search ?? null],
  );
  return Number(r?.n ?? 0);
}

export async function getVehicleCounts(orgId: string) {
  const r = await one<{ total: string; owned: string; partner: string; market: string }>(
    `select count(*)::text as total,
       count(*) filter (where owner_type='owned')::text as owned,
       count(*) filter (where owner_type='partner')::text as partner,
       count(*) filter (where owner_type='market')::text as market
     from vehicles where org_id=$1`,
    [orgId],
  );
  return {
    total: Number(r?.total ?? 0),
    owned: Number(r?.owned ?? 0),
    partner: Number(r?.partner ?? 0),
    market: Number(r?.market ?? 0),
  };
}

export const VEHICLE_PAGE_SIZE = PAGE_SIZE;
