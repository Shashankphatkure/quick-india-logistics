-- Up Migration
-- Performance: trigram indexes for ILIKE '%...%' searches + composite indexes
-- for the branch/status/date filters the list pages run constantly.

create extension if not exists pg_trgm;

-- Trigram GIN indexes for free-text search columns
create index if not exists idx_orders_docket_trgm on orders using gin (docket_no gin_trgm_ops);
create index if not exists idx_orders_shipper_trgm on orders using gin (shipper_name gin_trgm_ops);
create index if not exists idx_orders_consignee_trgm on orders using gin (consignee_name gin_trgm_ops);
create index if not exists idx_orders_ewaybill_trgm on orders using gin (ewaybill_no gin_trgm_ops);
create index if not exists idx_manifests_no_trgm on manifests using gin (manifest_no gin_trgm_ops);
create index if not exists idx_runsheets_no_trgm on runsheets using gin (runsheet_no gin_trgm_ops);
create index if not exists idx_commodities_name_trgm on commodities using gin (name gin_trgm_ops);
create index if not exists idx_branches_name_trgm on branches using gin (name gin_trgm_ops);
create index if not exists idx_vendors_name_trgm on vendors using gin (name gin_trgm_ops);
create index if not exists idx_users_fullname_trgm on users using gin (full_name gin_trgm_ops);
create index if not exists idx_assets_assetid_trgm on assets using gin (asset_id gin_trgm_ops);

-- Composite indexes for the common branch-scoped list/sort patterns
create index if not exists idx_orders_org_status_date on orders (org_id, status, booking_date desc);
create index if not exists idx_orders_origin_branch on orders (origin_branch_id) where origin_branch_id is not null;
create index if not exists idx_orders_dest_branch on orders (destination_branch_id) where destination_branch_id is not null;
create index if not exists idx_orders_current_branch on orders (current_branch_id) where current_branch_id is not null;
create index if not exists idx_manifests_from_branch on manifests (from_branch_id);
create index if not exists idx_manifests_to_branch on manifests (to_branch_id);
create index if not exists idx_manifests_org_state_date on manifests (org_id, state, manifest_date desc);
create index if not exists idx_runsheets_branch on runsheets (branch_id);
create index if not exists idx_runsheets_org_state_date on runsheets (org_id, state, runsheet_date desc);

-- Down Migration
drop index if exists idx_runsheets_org_state_date;
drop index if exists idx_runsheets_branch;
drop index if exists idx_manifests_org_state_date;
drop index if exists idx_manifests_to_branch;
drop index if exists idx_manifests_from_branch;
drop index if exists idx_orders_current_branch;
drop index if exists idx_orders_dest_branch;
drop index if exists idx_orders_origin_branch;
drop index if exists idx_orders_org_status_date;
drop index if exists idx_assets_assetid_trgm;
drop index if exists idx_users_fullname_trgm;
drop index if exists idx_vendors_name_trgm;
drop index if exists idx_branches_name_trgm;
drop index if exists idx_commodities_name_trgm;
drop index if exists idx_runsheets_no_trgm;
drop index if exists idx_manifests_no_trgm;
drop index if exists idx_orders_ewaybill_trgm;
drop index if exists idx_orders_consignee_trgm;
drop index if exists idx_orders_shipper_trgm;
drop index if exists idx_orders_docket_trgm;
