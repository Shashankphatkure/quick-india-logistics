-- Up Migration
-- Org-wide charge / surcharge master applied during invoicing. Previously the
-- /master/charges page hard-coded these; move them into the DB so they can be
-- added / removed per org.

create table if not exists charges (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  code          text not null,
  label         text not null,
  description   text,
  charge_type   text not null default 'flat' check (charge_type in ('percent','flat','per_kg','per_box')),
  default_value numeric(12,2) not null default 0,
  applies_to    text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index if not exists charges_code_per_org_uq on charges (org_id, lower(code));
create trigger charges_set_updated before update on charges
  for each row execute function set_updated_at();

-- Seed each org with the default charge codes the page used to hard-code.
insert into charges (org_id, code, label, description, charge_type, default_value, applies_to)
select o.id, d.code, d.label, d.description, d.charge_type, d.default_value, d.applies_to
from organizations o
cross join (values
  ('FUEL_SUR', 'Fuel Surcharge', 'Variable surcharge based on diesel price index', 'percent', 18, 'All freight'),
  ('HANDLING', 'Handling Charge', 'Per-shipment handling at origin/destination', 'flat', 50, 'Surface & Air'),
  ('COD_FEE', 'Cash on Delivery', 'COD collection fee — 2% of invoice value, min ₹100', 'percent', 2, 'COD shipments'),
  ('COLD_SUR', 'Cold Chain Surcharge', 'Premium for temperature-controlled handling', 'per_kg', 8, 'Cold chain'),
  ('DOCK_CHRG', 'Docket Charges', 'Documentation and processing fee', 'flat', 30, 'All orders'),
  ('INSURANCE', 'Transit Insurance', '0.1% of declared invoice value', 'percent', 0.1, 'High-value shipments'),
  ('ODA_DEL', 'ODA Delivery', 'Out-of-delivery-area surcharge', 'flat', 250, 'ODA pincodes'),
  ('WT_REC', 'Weight Reconciliation', 'Difference charge when chargeable > actual at coloader', 'per_kg', 12, 'Air shipments')
) as d(code, label, description, charge_type, default_value, applies_to)
on conflict (org_id, lower(code)) do nothing;

-- Down Migration
drop table if exists charges;
