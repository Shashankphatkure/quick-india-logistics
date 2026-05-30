-- Up Migration
-- Multi-row package dimensions and invoices per order. The orders table keeps
-- its single length_cm/breadth_cm/height_cm + invoice_* columns (first row, for
-- backward-compat and quick listing); these child tables hold the full set so
-- the Add Order wizard's "Add Another Dimension" / "Add Another Invoice" persist.

create table if not exists order_dimensions (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  length_cm    numeric(10,2),
  breadth_cm   numeric(10,2),
  height_cm    numeric(10,2),
  no_of_pieces integer not null default 1,
  created_at   timestamptz not null default now()
);
create index if not exists order_dimensions_order_idx on order_dimensions (order_id);

create table if not exists order_invoices (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references orders(id) on delete cascade,
  invoice_number text,
  invoice_date   date,
  invoice_value  numeric(14,2),
  ewaybill_no    text,
  created_at     timestamptz not null default now()
);
create index if not exists order_invoices_order_idx on order_invoices (order_id);

-- Down Migration
drop table if exists order_invoices;
drop table if exists order_dimensions;
