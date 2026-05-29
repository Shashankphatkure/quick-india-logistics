import 'server-only';
import { many, one } from '@/lib/db';
import { resolveSort } from '@/lib/sort';

export type AssetRow = {
  id: string;
  asset_id: string;
  asset_kind: string;
  barcode: string | null;
  logger_type: string | null;
  box_type: string | null;
  capacity_liters: string | null;
  manufacturer: string | null;
  current_branch_id: string | null;
  current_branch_name: string | null;
  in_use: boolean;
  usage_count: number;
  is_defective: boolean;
  cal_to: string | null;
};

const PAGE_SIZE = 25;

// Whitelisted sortable columns. Status is derived (defective/in_use/available) so it is not sortable.
const ASSET_SORT: Record<string, string> = {
  asset_id: 'a.asset_id',
  kind: 'a.asset_kind',
  branch: 'b.name',
  usage: 'a.usage_count',
  expiry: 'a.cal_to',
};

export type AssetStatusFilter = 'defective' | 'in_use' | 'available';

type AssetFilters = {
  orgId: string;
  search?: string;
  kind?: 'logger' | 'box';
  branchId?: string;
  status?: AssetStatusFilter;
};

// Shared WHERE. Params: $1 orgId, $2 search, $3 kind, $4 branchId(uuid), $5 status(text)
const ASSET_WHERE = `
  a.org_id = $1
  and ($2::text is null or a.asset_id ilike '%' || $2 || '%' or a.barcode ilike '%' || $2 || '%')
  and ($3::text is null or a.asset_kind = $3)
  and ($4::uuid is null or a.current_branch_id = $4::uuid)
  and ($5::text is null
       or ($5 = 'defective' and a.is_defective)
       or ($5 = 'in_use' and a.in_use and not a.is_defective)
       or ($5 = 'available' and not a.in_use and not a.is_defective))
`;

function whereParams(f: AssetFilters): unknown[] {
  return [f.orgId, f.search ?? null, f.kind ?? null, f.branchId ?? null, f.status ?? null];
}

export async function listAssets(
  opts: AssetFilters & { page?: number; sort?: string; dir?: string },
): Promise<AssetRow[]> {
  const page = Math.max(1, opts.page ?? 1);
  const order = resolveSort(opts.sort, opts.dir, ASSET_SORT, 'asset_id');
  return many<AssetRow>(
    `select a.id, a.asset_id, a.asset_kind, a.barcode,
            a.logger_type, a.box_type, a.capacity_liters::text,
            a.manufacturer, a.current_branch_id, b.name as current_branch_name,
            a.in_use, a.usage_count, a.is_defective,
            to_char(a.cal_to, 'DD-MM-YYYY') as cal_to
     from assets a left join branches b on b.id = a.current_branch_id
     where ${ASSET_WHERE}
     order by ${order.sql} nulls last, a.asset_id
     limit $6 offset $7`,
    [...whereParams(opts), PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
}

export async function countAssets(opts: AssetFilters) {
  const r = await one<{ n: string }>(
    `select count(*)::text as n from assets a where ${ASSET_WHERE}`,
    whereParams(opts),
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
