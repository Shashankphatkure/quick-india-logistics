import 'server-only';
import { many, one } from '@/lib/db';

export type AssetRow = {
  id: string;
  asset_id: string;
  asset_kind: string;
  barcode: string | null;
  logger_type: string | null;
  box_type: string | null;
  capacity_liters: string | null;
  manufacturer: string | null;
  current_branch_name: string | null;
  in_use: boolean;
  usage_count: number;
  is_defective: boolean;
  cal_to: string | null;
};

const PAGE_SIZE = 25;

export async function listAssets(opts: { orgId: string; search?: string; page?: number; kind?: 'logger' | 'box' }) {
  const page = Math.max(1, opts.page ?? 1);
  return many<AssetRow>(
    `select a.id, a.asset_id, a.asset_kind, a.barcode,
            a.logger_type, a.box_type, a.capacity_liters::text,
            a.manufacturer, b.name as current_branch_name,
            a.in_use, a.usage_count, a.is_defective,
            to_char(a.cal_to, 'DD-MM-YYYY') as cal_to
     from assets a left join branches b on b.id = a.current_branch_id
     where a.org_id=$1
       and ($2::text is null or a.asset_id ilike '%' || $2 || '%' or a.barcode ilike '%' || $2 || '%')
       and ($3::text is null or a.asset_kind = $3)
     order by a.asset_id
     limit $4 offset $5`,
    [opts.orgId, opts.search ?? null, opts.kind ?? null, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
}

export async function countAssets(opts: { orgId: string; search?: string; kind?: 'logger' | 'box' }) {
  const r = await one<{ n: string }>(
    `select count(*)::text as n from assets where org_id=$1
       and ($2::text is null or asset_id ilike '%' || $2 || '%' or barcode ilike '%' || $2 || '%')
       and ($3::text is null or asset_kind = $3)`,
    [opts.orgId, opts.search ?? null, opts.kind ?? null],
  );
  return Number(r?.n ?? 0);
}

export async function getAssetCounts(orgId: string) {
  const r = await one<{ total: string; loggers: string; boxes: string; in_use: string; defective: string }>(
    `select count(*)::text as total,
       count(*) filter (where asset_kind='logger')::text as loggers,
       count(*) filter (where asset_kind='box')::text as boxes,
       count(*) filter (where in_use)::text as in_use,
       count(*) filter (where is_defective)::text as defective
     from assets where org_id=$1`,
    [orgId],
  );
  return {
    total: Number(r?.total ?? 0),
    loggers: Number(r?.loggers ?? 0),
    boxes: Number(r?.boxes ?? 0),
    in_use: Number(r?.in_use ?? 0),
    defective: Number(r?.defective ?? 0),
  };
}

export const ASSET_PAGE_SIZE = PAGE_SIZE;
