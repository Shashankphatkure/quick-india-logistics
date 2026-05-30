-- Up Migration

-- Per-docket damage / shortage counts, set during hub receiving.
-- Surfaced as columns on the Pending-for-Dispatch and receiving screens.
alter table orders
  add column damaged_count int not null default 0,
  add column not_received_count int not null default 0;

-- Down Migration

alter table orders drop column if exists not_received_count;
alter table orders drop column if exists damaged_count;
