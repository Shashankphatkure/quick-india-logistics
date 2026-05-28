-- Up Migration

-- ====== ASSETS (loggers + boxes per transcripts) ======
create table assets (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references organizations(id) on delete cascade,
  asset_kind        text not null check (asset_kind in ('logger', 'box')),
  asset_id          text not null,                 -- human-readable label
  barcode           text,
  -- logger specifics
  logger_type       text check (logger_type in ('single_use', 'multi_use', 'dry_ice_single', 'dry_ice_multi', 'liquid_nitrogen')),
  manufacturer      text,
  manufacturer_pid  text,
  -- box specifics
  box_type          text check (box_type in ('credo', 'vype', 'cool_guard', 'iqo', 'sytle', 'vaq_tec')),
  capacity_liters   numeric(6,2),
  old_box_number    text,
  -- calibration (logger)
  cal_from          date,
  cal_to            date,
  cal_issuer        text,
  cal_issued_at     date,
  cal_document_url  text,
  -- state
  assigned_branch_id uuid references branches(id) on delete set null,
  current_branch_id  uuid references branches(id) on delete set null,
  in_use            boolean not null default false,
  usage_count       int not null default 0,
  is_defective      boolean not null default false,
  verified_by       uuid references users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create unique index assets_id_per_org_uq on assets (org_id, lower(asset_id));
create index assets_kind_idx on assets (org_id, asset_kind);
create index assets_current_branch_idx on assets (current_branch_id) where current_branch_id is not null;
create trigger assets_set_updated before update on assets
  for each row execute function set_updated_at();

-- Asset movement log
create table asset_movements (
  id           uuid primary key default gen_random_uuid(),
  asset_id     uuid not null references assets(id) on delete cascade,
  from_branch_id uuid references branches(id) on delete set null,
  to_branch_id   uuid references branches(id) on delete set null,
  order_id     uuid references orders(id) on delete set null,
  moved_at     timestamptz not null default now(),
  performed_by uuid references users(id) on delete set null
);
create index asset_movements_asset_idx on asset_movements (asset_id, moved_at desc);

-- ====== MANIFESTS ======
create table manifests (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid not null references organizations(id) on delete cascade,
  manifest_no         text not null,
  from_branch_id      uuid not null references branches(id) on delete restrict,
  to_branch_id        uuid not null references branches(id) on delete restrict,
  manifest_date       date not null default current_date,
  mode                text not null check (mode in ('local', 'air', 'surface', 'cargo', 'train', 'courier', 'warehouse', 'hub_transfer')),
  vendor_id           uuid references vendors(id) on delete set null,
  airway_bill_no      text,
  vehicle_no          text,
  forwarding_date     timestamptz,
  total_bags          int default 0,
  total_boxes         int default 0,
  docket_weight_kg    numeric(10,3),
  coloader_actual_kg  numeric(10,3),
  coloader_chargeable_kg numeric(10,3),
  rate_per_kg         numeric(10,2),
  tax_slab_pct        numeric(5,2),
  state               text not null default 'rough' check (state in ('rough', 'final', 'departed', 'arrived', 'received')),
  receipt_image_url   text,
  awb_image_url       text,
  created_by          uuid references users(id) on delete set null,
  departed_at         timestamptz,
  arrived_at          timestamptz,
  received_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create unique index manifests_no_per_org_uq on manifests (org_id, lower(manifest_no));
create index manifests_state_idx on manifests (org_id, state);
create index manifests_to_branch_idx on manifests (to_branch_id, state);
create trigger manifests_set_updated before update on manifests
  for each row execute function set_updated_at();

create table manifest_orders (
  manifest_id  uuid not null references manifests(id) on delete cascade,
  order_id     uuid not null references orders(id) on delete restrict,
  primary key (manifest_id, order_id)
);
create index manifest_orders_order_idx on manifest_orders (order_id);

-- ====== RUNSHEETS ======
create table runsheets (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  runsheet_no     text not null,
  branch_id       uuid not null references branches(id) on delete restrict,
  route           text,
  vehicle_no      text,
  driver_name     text,
  driver_phone    text,
  runsheet_date   date not null default current_date,
  state           text not null default 'rough' check (state in ('rough', 'final', 'out_for_delivery', 'completed')),
  created_by      uuid references users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index runsheets_no_per_org_uq on runsheets (org_id, lower(runsheet_no));
create index runsheets_state_idx on runsheets (org_id, state);
create index runsheets_branch_idx on runsheets (branch_id, runsheet_date desc);
create trigger runsheets_set_updated before update on runsheets
  for each row execute function set_updated_at();

create table runsheet_orders (
  runsheet_id  uuid not null references runsheets(id) on delete cascade,
  order_id     uuid not null references orders(id) on delete restrict,
  sequence_no  int,
  delivered_at timestamptz,
  primary key (runsheet_id, order_id)
);
create index runsheet_orders_order_idx on runsheet_orders (order_id);

-- Down Migration
drop table if exists runsheet_orders;
drop table if exists runsheets;
drop table if exists manifest_orders;
drop table if exists manifests;
drop table if exists asset_movements;
drop table if exists assets;
