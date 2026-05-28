-- Up Migration

alter table order_assets
  add column asset_id uuid references assets(id) on delete restrict,
  add column detached_at timestamptz;

create index order_assets_asset_idx on order_assets (asset_id) where asset_id is not null;
create unique index order_assets_active_uq on order_assets (order_id, asset_id) where asset_id is not null and detached_at is null;

-- Down Migration

drop index if exists order_assets_active_uq;
drop index if exists order_assets_asset_idx;
alter table order_assets drop column if exists detached_at;
alter table order_assets drop column if exists asset_id;
