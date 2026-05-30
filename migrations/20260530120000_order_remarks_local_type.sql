-- Up Migration

alter table orders
  add column remarks text,
  add column cod boolean not null default false,
  add column local_delivery_type text;

-- Down Migration

alter table orders drop column if exists local_delivery_type;
alter table orders drop column if exists cod;
alter table orders drop column if exists remarks;
