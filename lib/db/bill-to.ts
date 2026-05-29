import 'server-only';
import { many, one } from '@/lib/db';

export type BillToRow = {
  id: string;
  name: string;
  legal_name: string | null;
  pan: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  billing_cycle: string | null;
  is_eta_applicable: boolean;
  is_active: boolean;
  client_count: number;
  gst_count: number;
};

export type ClientRow = {
  id: string;
  bill_to_id: string;
  name: string;
  contact_person: string | null;
  contact_email: string | null;
  use_dimension: string;
  is_active: boolean;
};

const PAGE_SIZE = 25;

export async function listBillTos(opts: { orgId: string; search?: string; page?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  return many<BillToRow>(
    `select
       bt.id, bt.name, bt.legal_name, bt.pan,
       bt.contact_person, bt.contact_email, bt.contact_phone,
       bt.billing_cycle, bt.is_eta_applicable, bt.is_active,
       (select count(*)::int from clients c where c.bill_to_id = bt.id) as client_count,
       (select count(*)::int from bill_to_gst g where g.bill_to_id = bt.id) as gst_count
     from bill_to bt
     where bt.org_id = $1
       and ($2::text is null or bt.name ilike '%' || $2 || '%')
     order by bt.name
     limit $3 offset $4`,
    [opts.orgId, opts.search ?? null, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
}

export async function countBillTos(opts: { orgId: string; search?: string }) {
  const r = await one<{ n: string }>(
    `select count(*)::text as n from bill_to where org_id=$1 and ($2::text is null or name ilike '%' || $2 || '%')`,
    [opts.orgId, opts.search ?? null],
  );
  return Number(r?.n ?? 0);
}

export async function listClientsByBillTo(billToId: string): Promise<ClientRow[]> {
  return many<ClientRow>(
    `select id, bill_to_id, name, contact_person, contact_email, use_dimension, is_active
     from clients where bill_to_id = $1 order by name`,
    [billToId],
  );
}

export async function getBillToCounts(orgId: string) {
  const r = await one<{ total: string; active: string; eta: string; monthly: string }>(
    `select
       count(*)::text as total,
       count(*) filter (where is_active)::text as active,
       count(*) filter (where is_eta_applicable)::text as eta,
       count(*) filter (where billing_cycle = 'monthly')::text as monthly
     from bill_to where org_id = $1`,
    [orgId],
  );
  return {
    total: Number(r?.total ?? 0),
    active: Number(r?.active ?? 0),
    eta: Number(r?.eta ?? 0),
    monthly: Number(r?.monthly ?? 0),
  };
}

export const BILL_TO_PAGE_SIZE = PAGE_SIZE;

export type ClientDimensionFormula = {
  client_id: string;
  mode: string;
  divisor_x: number;
  multiplier_y: number;
};

/** All client dimension formulas for an org, for the add-order live preview. */
export async function listClientDimensionFormulas(orgId: string): Promise<ClientDimensionFormula[]> {
  return many<ClientDimensionFormula>(
    `select cdf.client_id, cdf.mode,
            cdf.divisor_x::float8 as divisor_x, cdf.multiplier_y::float8 as multiplier_y
     from client_dimension_formulas cdf
     join clients c on c.id = cdf.client_id
     join bill_to bt on bt.id = c.bill_to_id
     where bt.org_id = $1`,
    [orgId],
  );
}

/** Client's weight-billing config + formula for a mode (authoritative, server-side). */
export async function getClientDimensionConfig(
  clientId: string,
  mode: string,
): Promise<{ use_dimension: string; divisor_x: number | null; multiplier_y: number | null } | null> {
  return one<{ use_dimension: string; divisor_x: number | null; multiplier_y: number | null }>(
    `select c.use_dimension,
            f.divisor_x::float8 as divisor_x, f.multiplier_y::float8 as multiplier_y
     from clients c
     left join client_dimension_formulas f on f.client_id = c.id and f.mode = $2
     where c.id = $1`,
    [clientId, mode],
  );
}
