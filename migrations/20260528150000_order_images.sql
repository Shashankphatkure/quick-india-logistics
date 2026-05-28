-- Up Migration

create table order_images (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  kind         text not null check (kind in (
    'pod', 'pod_signature', 'pickup', 'delivery', 'damage',
    'ewaybill', 'invoice', 'other'
  )),
  s3_key       text not null,
  s3_bucket    text not null,
  content_type text,
  size_bytes   bigint,
  caption      text,
  uploaded_by  uuid references users(id) on delete set null,
  uploaded_at  timestamptz not null default now()
);
create index order_images_order_idx on order_images (order_id, uploaded_at desc);
create index order_images_kind_idx on order_images (order_id, kind);

-- Down Migration

drop table if exists order_images;
