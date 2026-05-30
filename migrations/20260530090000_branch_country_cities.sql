-- Up Migration

alter table branches
  add column country text not null default 'India',
  add column operating_cities text;

-- Down Migration

alter table branches drop column if exists operating_cities;
alter table branches drop column if exists country;
