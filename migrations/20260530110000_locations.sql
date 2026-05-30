-- Up Migration

create table locations (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  country         text not null default 'India',
  state           text not null,
  city            text not null,
  pincode         text,
  assigned_branch_id uuid references branches(id) on delete set null,
  in_use          boolean not null default true,
  is_active       boolean not null default true,
  created_by      uuid references users(id) on delete set null,
  validated_by    uuid references users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index locations_uq on locations (org_id, lower(state), lower(city), coalesce(pincode, ''));
create index locations_branch_idx on locations (assigned_branch_id);
create trigger locations_set_updated before update on locations
  for each row execute function set_updated_at();

-- Seed from existing branch cities so the page isn't empty.
insert into locations (org_id, country, state, city, pincode, assigned_branch_id, created_by, validated_by)
select b.org_id,
       coalesce(b.country, 'India'),
       coalesce(b.state, '—'),
       b.city,
       b.pincode,
       b.id,
       b.verified_by,
       b.verified_by
from branches b
where b.city is not null
on conflict do nothing;

-- Down Migration

drop table if exists locations;
