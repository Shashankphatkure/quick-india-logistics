-- Up Migration

insert into organizations (id, name, legal_name, is_active)
values ('00000000-0000-0000-0000-000000000001', 'Quick India Logistics', 'Quick India Logistics Pvt Ltd', true)
on conflict do nothing;

insert into users (id, org_id, username, full_name, email, is_active, must_change_pw)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000001', 'admin', 'Admin Manager', 'admin@qil.local', true, false),
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-000000000001', 'exec',  'Admin Executive', 'exec@qil.local',  true, false)
on conflict do nothing;

insert into commodity_types (id, org_id, name)
values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-000000000001', 'General'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000001', 'Perishable Food'),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-000000000001', 'Expiry Goods'),
  ('00000000-0000-0000-0000-0000000000b4', '00000000-0000-0000-0000-000000000001', 'Sample'),
  ('00000000-0000-0000-0000-0000000000b5', '00000000-0000-0000-0000-000000000001', 'Boundary Matters')
on conflict do nothing;

with t as (select id, name from commodity_types where org_id = '00000000-0000-0000-0000-000000000001')
insert into commodities (org_id, type_id, name, verified_by)
select '00000000-0000-0000-0000-000000000001', t.id, c.name, c.verifier
from (values
  ('Cement Pipe',       'General',         '00000000-0000-0000-0000-0000000000a1'::uuid),
  ('Cricket Balls',     'General',         '00000000-0000-0000-0000-0000000000a2'::uuid),
  ('Sweet',             'Perishable Food', '00000000-0000-0000-0000-0000000000a1'::uuid),
  ('Expiry Goods',      'Expiry Goods',    '00000000-0000-0000-0000-0000000000a1'::uuid),
  ('Sample',            'Sample',          '00000000-0000-0000-0000-0000000000a1'::uuid),
  ('Boundary Matters',  'General',         '00000000-0000-0000-0000-0000000000a1'::uuid),
  ('Paints',            'General',         '00000000-0000-0000-0000-0000000000a1'::uuid),
  ('Sales',             'General',         '00000000-0000-0000-0000-0000000000a1'::uuid),
  ('Shooting Material', 'General',         '00000000-0000-0000-0000-0000000000a1'::uuid),
  ('Spare Parts',       'General',         '00000000-0000-0000-0000-0000000000a1'::uuid)
) as c(name, type_name, verifier)
join t on t.name = c.type_name
on conflict do nothing;

-- Down Migration

delete from commodities where org_id = '00000000-0000-0000-0000-000000000001';
delete from commodity_types where org_id = '00000000-0000-0000-0000-000000000001';
delete from users where org_id = '00000000-0000-0000-0000-000000000001';
delete from organizations where id = '00000000-0000-0000-0000-000000000001';
