-- Up Migration

-- Seed departments (transcripts: existing 7-8 departments)
insert into departments (id, org_id, name) values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000001', 'Admin'),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-000000000001', 'Operation'),
  ('00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-000000000001', 'Customer Support'),
  ('00000000-0000-0000-0000-0000000000c4', '00000000-0000-0000-0000-000000000001', 'Data Entry'),
  ('00000000-0000-0000-0000-0000000000c5', '00000000-0000-0000-0000-000000000001', 'Accounts'),
  ('00000000-0000-0000-0000-0000000000c6', '00000000-0000-0000-0000-000000000001', 'Software'),
  ('00000000-0000-0000-0000-0000000000c7', '00000000-0000-0000-0000-000000000001', 'Home')
on conflict do nothing;

-- Seed designations
insert into designations (id, org_id, name) values
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-000000000001', 'Super User'),
  ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-000000000001', 'Admin Manager'),
  ('00000000-0000-0000-0000-0000000000d3', '00000000-0000-0000-0000-000000000001', 'Admin Executive'),
  ('00000000-0000-0000-0000-0000000000d4', '00000000-0000-0000-0000-000000000001', 'Manager'),
  ('00000000-0000-0000-0000-0000000000d5', '00000000-0000-0000-0000-000000000001', 'Executive'),
  ('00000000-0000-0000-0000-0000000000d6', '00000000-0000-0000-0000-000000000001', 'Senior Executive')
on conflict do nothing;

-- Seed sample branches (matches existing UI mock + transcript names)
insert into branches (id, org_id, code, name, alias, branch_type, email, phone, address_line, state, city, pincode, head_name, head_phone, verified_by) values
  ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-000000000001', 'QIL-AMRITSAR', 'QIL-AMRITSAR', 'Amritsar HO', 'hub',
   'amritsar@quickindialogistics.com', '9876543210', '12 GT Road', 'Punjab', 'Amritsar', '143001', 'Priya Sharma', '9876543210',
   '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-000000000001', 'QIL-DELHI', 'QIL-DELHI', 'Delhi Branch', 'branch',
   'delhi@quickindialogistics.com', '9876543211', '4 Connaught Place', 'Delhi', 'New Delhi', '110001', 'Amar Singh', '9876543211',
   '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000e3', '00000000-0000-0000-0000-000000000001', 'QIL-NAGPUR', 'QIL-NAGPUR', 'Nagpur Branch', 'branch',
   'nagpur@quickindialogistics.com', '9876543212', '8 Civil Lines', 'Maharashtra', 'Nagpur', '440001', 'Roshan Patil', '9876543212',
   '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000e4', '00000000-0000-0000-0000-000000000001', 'QIL-TRIPURA', 'QIL-TRIPURA', 'Tripura Vendor', 'vendor',
   'info@quickindialogistics.com', '9876750555', 'North Tripura', 'Tripura', 'North Tripura', '799264', 'Swati', '9876750555',
   '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000e5', '00000000-0000-0000-0000-000000000001', 'QIL-MUMBAI', 'QIL-MUMBAI', 'Mumbai Hub', 'hub',
   'mumbai@quickindialogistics.com', '9876543213', 'Andheri East', 'Maharashtra', 'Mumbai', '400069', 'Ganesh Iyer', '9876543213',
   '00000000-0000-0000-0000-0000000000a1')
on conflict do nothing;

-- Set admin user's home branch + dept/designation
update users set
  department_id  = '00000000-0000-0000-0000-0000000000c1',
  designation_id = '00000000-0000-0000-0000-0000000000d2',
  home_branch_id = '00000000-0000-0000-0000-0000000000e1',
  user_type      = 'super_admin',
  channel_access = 'web_and_mobile'
where id = '00000000-0000-0000-0000-0000000000a1';

update users set
  department_id  = '00000000-0000-0000-0000-0000000000c1',
  designation_id = '00000000-0000-0000-0000-0000000000d3',
  home_branch_id = '00000000-0000-0000-0000-0000000000e2',
  user_type      = 'employee',
  channel_access = 'web'
where id = '00000000-0000-0000-0000-0000000000a2';

-- Give admin access to all branches
insert into user_branches (user_id, branch_id, is_primary) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000e1', true),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000e2', false),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000e3', false),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000e4', false),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000e5', false),
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000e2', true)
on conflict do nothing;

-- Seed sample Bill-To + Clients (CFA pattern, per transcripts)
-- Mylan Pharmaceuticals is a real example from transcripts
insert into bill_to (id, org_id, name, legal_name, contact_person, contact_email, billing_cycle, is_eta_applicable) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000001', 'Mylan CFA',
   'Mylan Pharmaceuticals India Pvt Ltd', 'CFA Contact', 'cfa@mylan.example', 'monthly', true),
  ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-000000000001', 'Goldmend Health Co',
   'Goldmend Health Private Limited', 'Accounts', 'accounts@goldmend.example', 'monthly', true),
  ('00000000-0000-0000-0000-0000000000f3', '00000000-0000-0000-0000-000000000001', 'Quick India Logistics (Self)',
   'Quick India Logistics Pvt Ltd', 'Self Billing', 'self@quickindialogistics.com', 'monthly', true)
on conflict do nothing;

insert into clients (id, bill_to_id, name, contact_person, contact_email, use_dimension, cft_value, mis_recipient_email) values
  -- Mylan CFA has multiple clients underneath (transcripts: "billing splits 10 ways")
  ('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-0000000000f1', 'Mylan Pharmaceuticals',     'Demand Planning', 'demand@mylan.example', 'use_kg',  166.000, 'mis@mylan.example'),
  ('00000000-0000-0000-0000-00000000a002', '00000000-0000-0000-0000-0000000000f1', 'Mylan Speciality',         'Specialty Ops',   'spec@mylan.example',  'use_kg',  166.000, 'mis@mylan.example'),
  -- Goldmend
  ('00000000-0000-0000-0000-00000000a003', '00000000-0000-0000-0000-0000000000f2', 'Goldmend Health',           'Logistics',       'logistics@goldmend.example', 'use_kg', 5000.000, 'mis@goldmend.example'),
  -- Self
  ('00000000-0000-0000-0000-00000000a004', '00000000-0000-0000-0000-0000000000f3', 'Quick India Logistics',     'Self',            'self@quickindialogistics.com', 'dont_use', null, null)
on conflict do nothing;

-- Sample per-client dimension formulas
insert into client_dimension_formulas (client_id, mode, divisor_x, multiplier_y) values
  ('00000000-0000-0000-0000-00000000a001', 'air',     6000, 1),
  ('00000000-0000-0000-0000-00000000a001', 'surface', 5000, 1),
  ('00000000-0000-0000-0000-00000000a002', 'air',     6000, 1),
  ('00000000-0000-0000-0000-00000000a003', 'air',     6000, 1)
on conflict do nothing;

-- Seed sample vendor
insert into vendors (id, org_id, name, pan, company_type, service_region, line_of_business, primary_email, primary_phone, status, verified_by) values
  ('00000000-0000-0000-0000-00000000b001', '00000000-0000-0000-0000-000000000001', 'Omnilinkar Cargo Private Limited',
   'AAPCO1181N', 'Pvt Ltd', 'pan_india', 'Coloader', 'info@omnilinkar.example', '8335683424', 'approved',
   '00000000-0000-0000-0000-0000000000a1')
on conflict do nothing;

-- Seed sample orders matching the existing UI mock
insert into orders (
  org_id, docket_no, booking_date, bill_to_id, client_id,
  shipper_name, consignee_name, origin, destination,
  origin_branch_id, destination_branch_id,
  mode, delivery_type, is_cold_chain, priority,
  status, lock_state, created_branch_id, current_branch_id, created_by
) values
  ('00000000-0000-0000-0000-000000000001', '738396',  '2026-05-09',
   '00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-00000000a001',
   'Mylan Pharma', 'C&F Delhi Mylan', 'New Delhi', 'Amritsar, Punjab',
   '00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000e1',
   'air', 'domestic', true, 'priority',
   'received', 'data_entry',
   '00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000e2',
   '00000000-0000-0000-0000-0000000000a1'),

  ('00000000-0000-0000-0000-000000000001', '4188696', '2026-05-07',
   '00000000-0000-0000-0000-0000000000f3', '00000000-0000-0000-0000-00000000a004',
   'Quick India', 'Quick India Logistics Pvt', 'Amritsar', 'New Delhi',
   '00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000e2',
   'surface', 'domestic', false, 'normal',
   'departed', 'operation',
   '00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000e1',
   '00000000-0000-0000-0000-0000000000a1'),

  ('00000000-0000-0000-0000-000000000001', '4188475', '2026-05-06',
   '00000000-0000-0000-0000-0000000000f3', '00000000-0000-0000-0000-00000000a004',
   'Quick India', 'Quick India Logistics', 'Amritsar', 'New Delhi',
   '00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000e2',
   'surface', 'domestic', false, 'normal',
   'received', 'data_entry',
   '00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000e1',
   '00000000-0000-0000-0000-0000000000a1'),

  ('00000000-0000-0000-0000-000000000001', '738433',  '2026-05-06',
   '00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-00000000a001',
   'Mylan Pharma', 'B.d.s Pharma', 'New Delhi', 'Amritsar, Punjab',
   '00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000e1',
   'air', 'domestic', true, 'priority',
   'delivered', 'accounts',
   '00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000e1',
   '00000000-0000-0000-0000-0000000000a1'),

  ('00000000-0000-0000-0000-000000000001', '750424',  '2026-05-06',
   '00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-00000000a001',
   'Mylan Pharma', 'Geetax Medicine Centre', 'New Delhi', 'Amritsar',
   '00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000e1',
   'air', 'domestic', true, 'normal',
   'departed', 'operation',
   '00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000e1',
   '00000000-0000-0000-0000-0000000000a1'),

  ('00000000-0000-0000-0000-000000000001', '4187812', '2026-05-06',
   '00000000-0000-0000-0000-0000000000f3', '00000000-0000-0000-0000-00000000a004',
   'Quick India', 'Quick India Logistics', 'Amritsar', 'New Delhi',
   '00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000e2',
   'surface', 'domestic', false, 'normal',
   'received', 'data_entry',
   '00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000e1',
   '00000000-0000-0000-0000-0000000000a1'),

  ('00000000-0000-0000-0000-000000000001', '4187204', '2026-05-06',
   '00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-00000000a003',
   'Goldmend Health', 'The Care Sri Cghs', 'New Delhi', 'Amritsar',
   '00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000e1',
   'surface', 'domestic', false, 'normal',
   'delivered', 'accounts',
   '00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000e1',
   '00000000-0000-0000-0000-0000000000a1')
on conflict do nothing;

-- Down Migration

delete from orders where org_id = '00000000-0000-0000-0000-000000000001';
delete from vendors where org_id = '00000000-0000-0000-0000-000000000001';
delete from client_dimension_formulas;
delete from clients;
delete from bill_to where org_id = '00000000-0000-0000-0000-000000000001';
delete from user_branches;
update users set department_id = null, designation_id = null, home_branch_id = null where org_id = '00000000-0000-0000-0000-000000000001';
delete from branches where org_id = '00000000-0000-0000-0000-000000000001';
delete from designations where org_id = '00000000-0000-0000-0000-000000000001';
delete from departments where org_id = '00000000-0000-0000-0000-000000000001';
