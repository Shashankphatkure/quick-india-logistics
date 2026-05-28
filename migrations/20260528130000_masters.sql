-- Up Migration

-- Departments (per transcripts: Data Entry, Customer Support, Operation, Accounts, Admin, etc.)
create table departments (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  name        text not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create unique index departments_name_per_org_uq on departments (org_id, lower(name));

create table designations (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  name        text not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create unique index designations_name_per_org_uq on designations (org_id, lower(name));

-- Branches
create table branches (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  code            text not null,
  name            text not null,
  alias           text,
  branch_type     text not null check (branch_type in ('hub', 'branch', 'franchise', 'vendor')),
  vendor_mode     text check (vendor_mode in ('by_vehicle', 'by_air', 'by_surface')),
  email           text,
  phone           text,
  address_line    text,
  state           text,
  city            text,
  pincode         text,
  head_name       text,
  head_email      text,
  head_phone      text,
  verified_by     uuid references users(id) on delete set null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index branches_code_per_org_uq on branches (org_id, lower(code));
create index branches_name_idx on branches (lower(name));
create index branches_active_idx on branches (org_id) where is_active;
create trigger branches_set_updated before update on branches
  for each row execute function set_updated_at();

-- Bill-To (entity QIL invoices; per transcripts this is often a CFA / 3PL)
create table bill_to (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  name            text not null,
  legal_name      text,
  pan             text,
  contact_person  text,
  contact_email   text,
  contact_phone   text,
  billing_address text,
  credit_limit    numeric(14,2),
  is_eta_applicable boolean not null default true,
  billing_cycle   text check (billing_cycle in ('daily', 'weekly', 'monthly')),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index bill_to_name_per_org_uq on bill_to (org_id, lower(name));
create trigger bill_to_set_updated before update on bill_to
  for each row execute function set_updated_at();

-- Multiple GST numbers per bill-to (one per state)
create table bill_to_gst (
  id          uuid primary key default gen_random_uuid(),
  bill_to_id  uuid not null references bill_to(id) on delete cascade,
  state       text not null,
  gst_number  text not null,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);
create unique index bill_to_gst_uq on bill_to_gst (bill_to_id, lower(gst_number));

-- Clients (under Bill-To, CFA pattern; transcripts: "Bill-To has many Clients")
create table clients (
  id              uuid primary key default gen_random_uuid(),
  bill_to_id      uuid not null references bill_to(id) on delete cascade,
  name            text not null,
  legal_name      text,
  contact_person  text,
  contact_email   text,
  contact_phone   text,
  use_dimension   text not null default 'use_kg' check (use_dimension in ('use_kg', 'dont_use', 'use_box')),
  cft_value       numeric(10,3),
  mis_recipient_email text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index clients_name_per_billto_uq on clients (bill_to_id, lower(name));
create trigger clients_set_updated before update on clients
  for each row execute function set_updated_at();

-- Per-client dimension formula per mode (transcripts: L*B*H / X * Y, varies by mode)
create table client_dimension_formulas (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id) on delete cascade,
  mode          text not null check (mode in ('local', 'air', 'surface', 'cargo', 'train', 'courier', 'warehouse')),
  divisor_x     numeric(10,3) not null,
  multiplier_y  numeric(10,3) not null default 1,
  created_at    timestamptz not null default now()
);
create unique index client_dim_uq on client_dimension_formulas (client_id, mode);

-- Vendors (coloaders)
create table vendors (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  name            text not null,
  pan             text,
  company_type    text,
  line_of_business text,
  service_region  text check (service_region in ('pan_india', 'state', 'city')),
  is_msme         boolean not null default false,
  primary_email   text,
  primary_phone   text,
  secondary_email text,
  secondary_phone text,
  verified_by     uuid references users(id) on delete set null,
  is_active       boolean not null default true,
  status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index vendors_name_per_org_uq on vendors (org_id, lower(name));
create trigger vendors_set_updated before update on vendors
  for each row execute function set_updated_at();

create table vendor_gst (
  id          uuid primary key default gen_random_uuid(),
  vendor_id   uuid not null references vendors(id) on delete cascade,
  state       text not null,
  gst_number  text not null,
  is_primary  boolean not null default false
);
create unique index vendor_gst_uq on vendor_gst (vendor_id, lower(gst_number));

-- Per-vendor dimension formula per mode (mirrors client formulas)
create table vendor_dimension_formulas (
  id            uuid primary key default gen_random_uuid(),
  vendor_id     uuid not null references vendors(id) on delete cascade,
  mode          text not null check (mode in ('local', 'air', 'surface', 'cargo', 'train', 'courier', 'warehouse')),
  divisor_x     numeric(10,3) not null,
  multiplier_y  numeric(10,3) not null default 1,
  created_at    timestamptz not null default now()
);
create unique index vendor_dim_uq on vendor_dimension_formulas (vendor_id, mode);

-- Vehicles
create table vehicles (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  number      text not null,
  vehicle_type text check (vehicle_type in ('truck', 'van', 'bike', 'tempo', 'mini_truck')),
  owner_type  text check (owner_type in ('owned', 'partner', 'market')),
  model       text,
  capacity_kg numeric(10,2),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index vehicles_number_per_org_uq on vehicles (org_id, lower(number));
create trigger vehicles_set_updated before update on vehicles
  for each row execute function set_updated_at();

-- TAT master per (client, mode, origin_branch, destination_branch)
create table tat_routes (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references clients(id) on delete cascade,
  mode                text not null check (mode in ('local', 'air', 'surface', 'cargo', 'train', 'courier', 'warehouse')),
  origin_branch_id    uuid not null references branches(id) on delete cascade,
  destination_branch_id uuid not null references branches(id) on delete cascade,
  tat_hours           int not null check (tat_hours > 0),
  rate_per_kg         numeric(10,2),
  created_at          timestamptz not null default now()
);
create unique index tat_routes_uq on tat_routes (client_id, mode, origin_branch_id, destination_branch_id);

-- Down Migration

drop table if exists tat_routes;
drop table if exists vehicles;
drop table if exists vendor_dimension_formulas;
drop table if exists vendor_gst;
drop table if exists vendors;
drop table if exists client_dimension_formulas;
drop table if exists clients;
drop table if exists bill_to_gst;
drop table if exists bill_to;
drop table if exists branches;
drop table if exists designations;
drop table if exists departments;
