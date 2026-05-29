-- Up Migration
-- Maker-checker lock_state advancement history: who moved an order from which
-- stage to which, when, and an optional note.

create table if not exists order_lock_events (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  from_state    text not null,
  to_state      text not null,
  performed_by  uuid references users(id),
  performed_at  timestamptz not null default now(),
  note          text
);

create index if not exists idx_order_lock_events_order on order_lock_events (order_id, performed_at desc);

-- Down Migration
drop table if exists order_lock_events;
