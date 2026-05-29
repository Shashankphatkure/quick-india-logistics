-- Up Migration
-- Store the per-order package dimensions so volumetric / chargeable weight is
-- auditable and recomputable. Nullable: dimensions are optional at booking time.

alter table orders add column if not exists length_cm  numeric(10,2);
alter table orders add column if not exists breadth_cm numeric(10,2);
alter table orders add column if not exists height_cm  numeric(10,2);

-- Down Migration
alter table orders drop column if exists height_cm;
alter table orders drop column if exists breadth_cm;
alter table orders drop column if exists length_cm;
