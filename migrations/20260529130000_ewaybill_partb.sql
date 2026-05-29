-- Up Migration
-- E-way bill Part-B = transporter / vehicle details added before dispatch.
-- Internal tracking only (no GST API). ewaybill_part_b_done already exists.

alter table orders add column if not exists ewaybill_part_b_vehicle_no       text;
alter table orders add column if not exists ewaybill_part_b_transporter_name text;
alter table orders add column if not exists ewaybill_part_b_filled_at         timestamptz;

-- Down Migration
alter table orders drop column if exists ewaybill_part_b_filled_at;
alter table orders drop column if exists ewaybill_part_b_transporter_name;
alter table orders drop column if exists ewaybill_part_b_vehicle_no;
