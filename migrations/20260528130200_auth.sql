-- Up Migration

-- Add FKs and additional auth fields to users
alter table users
  add column department_id   uuid references departments(id) on delete set null,
  add column designation_id  uuid references designations(id) on delete set null,
  add column home_branch_id  uuid references branches(id) on delete set null,
  add column user_type       text check (user_type in ('employee', 'manager', 'admin', 'super_admin')) default 'employee',
  add column channel_access  text check (channel_access in ('web', 'mobile', 'web_and_mobile')) default 'web',
  add column last_login_at   timestamptz;

-- Many-to-many: which branches each user can see (transcripts: branch-isolated visibility)
create table user_branches (
  user_id    uuid not null references users(id) on delete cascade,
  branch_id  uuid not null references branches(id) on delete cascade,
  is_primary boolean not null default false,
  primary key (user_id, branch_id)
);
create index user_branches_user_idx on user_branches (user_id);
create index user_branches_branch_idx on user_branches (branch_id);

-- Sessions (cookie-based, server-validated)
create table sessions (
  id            text primary key,
  user_id       uuid not null references users(id) on delete cascade,
  expires_at    timestamptz not null,
  user_agent    text,
  ip_address    inet,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);
create index sessions_user_idx on sessions (user_id);
create index sessions_expires_idx on sessions (expires_at);

-- Login audit (transcripts: 74k row login table, but useful for active-time reporting)
create table login_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  event_type   text not null check (event_type in ('login_success', 'login_failure', 'logout', 'forced_logout')),
  ip_address   inet,
  user_agent   text,
  occurred_at  timestamptz not null default now()
);
create index login_events_user_idx on login_events (user_id, occurred_at desc);

-- Down Migration

drop table if exists login_events;
drop table if exists sessions;
drop table if exists user_branches;
alter table users
  drop column if exists last_login_at,
  drop column if exists channel_access,
  drop column if exists user_type,
  drop column if exists home_branch_id,
  drop column if exists designation_id,
  drop column if exists department_id;
