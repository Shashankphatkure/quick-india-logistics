import 'server-only';
import { many, one } from '@/lib/db';

export type LoginEventRow = {
  id: string;
  event_type: string;
  user_name: string;
  username: string;
  ip_address: string | null;
  user_agent: string | null;
  occurred_at: string;
};

const PAGE_SIZE = 25;

export async function listLoginEvents(opts: { orgId: string; eventType?: string; page?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  return many<LoginEventRow>(
    `select le.id, le.event_type, u.full_name as user_name, u.username,
            le.ip_address::text, le.user_agent,
            to_char(le.occurred_at, 'DD-MM-YYYY HH24:MI') as occurred_at
     from login_events le join users u on u.id = le.user_id
     where u.org_id=$1
       and ($2::text is null or le.event_type = $2)
     order by le.occurred_at desc
     limit $3 offset $4`,
    [opts.orgId, opts.eventType ?? null, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
}

export async function countLoginEvents(opts: { orgId: string; eventType?: string }) {
  const r = await one<{ n: string }>(
    `select count(*)::text as n from login_events le join users u on u.id = le.user_id
     where u.org_id=$1 and ($2::text is null or le.event_type = $2)`,
    [opts.orgId, opts.eventType ?? null],
  );
  return Number(r?.n ?? 0);
}

export async function getLoginEventCounts(orgId: string) {
  const r = await one<{ total: string; success: string; failure: string; logout: string }>(
    `select count(*)::text as total,
       count(*) filter (where le.event_type='login_success')::text as success,
       count(*) filter (where le.event_type='login_failure')::text as failure,
       count(*) filter (where le.event_type='logout')::text as logout
     from login_events le join users u on u.id=le.user_id where u.org_id=$1`,
    [orgId],
  );
  return {
    total: Number(r?.total ?? 0),
    success: Number(r?.success ?? 0),
    failure: Number(r?.failure ?? 0),
    logout: Number(r?.logout ?? 0),
  };
}

export const LOGIN_PAGE_SIZE = PAGE_SIZE;
