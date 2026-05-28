-- Up Migration

create extension if not exists "pgcrypto";

create table organizations (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  pan          text,
  tan          text,
  legal_name   text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index organizations_name_uq on organizations (lower(name));

create table users (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete restrict,
  username        text not null,
  email           text,
  phone           text,
  full_name       text not null,
  password_hash   text,
  is_active       boolean not null default true,
  must_change_pw  boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index users_username_per_org_uq on users (org_id, lower(username));
create index users_email_idx on users (lower(email));

create table commodity_types (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  name        text not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create unique index commodity_types_name_per_org_uq on commodity_types (org_id, lower(name));

create table commodities (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  type_id         uuid not null references commodity_types(id) on delete restrict,
  name            text not null,
  verified_by     uuid references users(id) on delete set null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index commodities_name_per_org_uq on commodities (org_id, lower(name));
create index commodities_type_idx on commodities (type_id);
create index commodities_org_active_idx on commodities (org_id) where is_active;

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger organizations_set_updated before update on organizations
  for each row execute function set_updated_at();
create trigger users_set_updated before update on users
  for each row execute function set_updated_at();
create trigger commodities_set_updated before update on commodities
  for each row execute function set_updated_at();

-- Down Migration

drop trigger if exists commodities_set_updated on commodities;
drop trigger if exists users_set_updated on users;
drop trigger if exists organizations_set_updated on organizations;
drop function if exists set_updated_at();
drop table if exists commodities;
drop table if exists commodity_types;
drop table if exists users;
drop table if exists organizations;
