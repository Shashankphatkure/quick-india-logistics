import 'server-only';
import { many, one } from '@/lib/db';

export type ChargeType = 'percent' | 'flat' | 'per_kg' | 'per_box';

export type ChargeRow = {
  id: string;
  code: string;
  label: string;
  description: string | null;
  charge_type: ChargeType;
  default_value: string;
  applies_to: string | null;
  is_active: boolean;
};

export async function listCharges(orgId: string): Promise<ChargeRow[]> {
  return many<ChargeRow>(
    `select id, code, label, description, charge_type, default_value::text, applies_to, is_active
     from charges
     where org_id = $1
     order by is_active desc, code`,
    [orgId],
  );
}

export type ChargeCounts = { total: number; percent: number; flat: number; weight: number };

export async function getChargeCounts(orgId: string): Promise<ChargeCounts> {
  const r = await one<{ total: string; percent: string; flat: string; weight: string }>(
    `select count(*)::text as total,
            count(*) filter (where charge_type = 'percent')::text as percent,
            count(*) filter (where charge_type = 'flat')::text as flat,
            count(*) filter (where charge_type in ('per_kg','per_box'))::text as weight
     from charges where org_id = $1 and is_active`,
    [orgId],
  );
  return {
    total: Number(r?.total ?? 0),
    percent: Number(r?.percent ?? 0),
    flat: Number(r?.flat ?? 0),
    weight: Number(r?.weight ?? 0),
  };
}
