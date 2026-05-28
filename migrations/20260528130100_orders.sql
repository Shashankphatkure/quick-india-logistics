-- Up Migration

-- Orders (a.k.a. dockets). The core entity that flows pickup → manifest → runsheet → delivery.
create table orders (
  id                    uuid primary key default gen_random_uuid(),
  org_id                uuid not null references organizations(id) on delete cascade,
  docket_no             text not null,
  booking_date          date not null default current_date,
  -- Parties
  bill_to_id            uuid references bill_to(id) on delete restrict,
  client_id             uuid references clients(id) on delete restrict,
  shipper_name          text not null,
  shipper_address       text,
  shipper_phone         text,
  consignee_name        text not null,
  consignee_address     text,
  consignee_phone       text,
  -- Geography
  origin                text not null,
  destination           text not null,
  origin_branch_id      uuid references branches(id) on delete set null,
  destination_branch_id uuid references branches(id) on delete set null,
  -- Mode & type
  mode                  text not null check (mode in ('local', 'air', 'surface', 'cargo', 'train', 'courier', 'warehouse')),
  delivery_type         text not null check (delivery_type in ('local', 'domestic', 'international')),
  is_cold_chain         boolean not null default false,
  priority              text not null default 'normal' check (priority in ('normal', 'priority', 'urgent')),
  -- Weight
  actual_weight_kg      numeric(10,3),
  dimension_weight_kg   numeric(10,3),
  chargeable_weight_kg  numeric(10,3),
  -- Counts
  no_of_pieces          int default 0,
  no_of_bags            int default 0,
  no_of_boxes           int default 0,
  no_of_vials           int default 0,
  -- Money
  invoice_value         numeric(14,2),
  invoice_number        text,
  invoice_date          date,
  cod_value             numeric(14,2),
  -- E-way bill
  ewaybill_no           text,
  ewaybill_valid_until  timestamptz,
  ewaybill_part_b_done  boolean not null default false,
  -- Status (the high-level state — granular events in order_status_events)
  status                text not null default 'received' check (status in (
    'received', 'pickup_done', 'arrived_at_hub', 'connected',
    'departed', 'arrived_at_destination', 'out_for_delivery',
    'delivered', 'damaged', 'not_received', 'cancelled'
  )),
  estimated_delivery_at timestamptz,
  delivered_at          timestamptz,
  pod_image_url         text,
  pod_signature_url     text,
  pod_recipient_name    text,
  pod_recipient_phone   text,
  -- Lock state (maker-checker per transcripts)
  lock_state            text not null default 'data_entry' check (lock_state in ('data_entry', 'customer_care', 'operation', 'accounts', 'admin_locked')),
  created_branch_id     uuid references branches(id) on delete set null,
  current_branch_id     uuid references branches(id) on delete set null,
  created_by            uuid references users(id) on delete set null,
  -- Audit
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create unique index orders_docket_per_org_uq on orders (org_id, lower(docket_no));
create index orders_booking_date_idx on orders (org_id, booking_date desc);
create index orders_status_idx on orders (org_id, status);
create index orders_client_idx on orders (client_id) where client_id is not null;
create index orders_cold_chain_idx on orders (org_id) where is_cold_chain;
create index orders_ewaybill_idx on orders (lower(ewaybill_no)) where ewaybill_no is not null;
create trigger orders_set_updated before update on orders
  for each row execute function set_updated_at();

-- Status timeline (one row per status transition)
create table order_status_events (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  status       text not null,
  note         text,
  vehicle_no   text,
  location     text,
  performed_by uuid references users(id) on delete set null,
  performed_at timestamptz not null default now()
);
create index order_status_events_order_idx on order_status_events (order_id, performed_at);

-- Cold-chain assets attached per order (logger + box from Asset master, to be added later)
create table order_assets (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  asset_kind  text not null check (asset_kind in ('logger', 'box')),
  asset_label text not null,
  attached_at timestamptz not null default now()
);
create index order_assets_order_idx on order_assets (order_id);

-- Down Migration

drop table if exists order_assets;
drop table if exists order_status_events;
drop table if exists orders;
