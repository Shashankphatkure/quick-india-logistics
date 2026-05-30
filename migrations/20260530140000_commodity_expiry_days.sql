-- Up Migration
-- Shelf life (in days) for perishable / expiry-goods commodities so ops can see
-- how long a consignment stays good. Nullable: only meaningful for perishables.

alter table commodities add column if not exists expiry_days integer;

-- Down Migration
alter table commodities drop column if exists expiry_days;
