import 'server-only';
import { cookies, headers } from 'next/headers';
import { randomBytes, createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { many, one, query } from '@/lib/db';

const SESSION_COOKIE = 'qil_sid';
const SESSION_DAYS_DEFAULT = 1;
const SESSION_DAYS_REMEMBER = 30;

export type SessionUser = {
  userId: string;
  orgId: string;
  username: string;
  fullName: string;
  email: string | null;
  userType: string | null;
  homeBranchId: string | null;
  branchIds: string[];
};

function newSessionId(): string {
  return randomBytes(32).toString('base64url');
}

function hashSessionId(id: string): string {
  return createHash('sha256').update(id).digest('hex');
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function loginWithPassword(input: {
  username: string;
  password: string;
  remember?: boolean;
}): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const user = await one<{ id: string; password_hash: string | null; is_active: boolean }>(
    `select id, password_hash, is_active from users where lower(username) = lower($1) limit 1`,
    [input.username.trim()],
  );

  if (!user || !user.is_active || !user.password_hash) {
    return { ok: false, error: 'Invalid username or password' };
  }

  const ok = await verifyPassword(input.password, user.password_hash);
  if (!ok) {
    await query(
      `insert into login_events (user_id, event_type, ip_address, user_agent) values ($1, 'login_failure', $2, $3)`,
      [user.id, getClientIp(), getUserAgent()],
    );
    return { ok: false, error: 'Invalid username or password' };
  }

  const sid = newSessionId();
  const sidHash = hashSessionId(sid);
  const days = input.remember ? SESSION_DAYS_REMEMBER : SESSION_DAYS_DEFAULT;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await query(
    `insert into sessions (id, user_id, expires_at, user_agent, ip_address)
     values ($1, $2, $3, $4, $5)`,
    [sidHash, user.id, expiresAt, getUserAgent(), getClientIp()],
  );

  await query(
    `insert into login_events (user_id, event_type, ip_address, user_agent) values ($1, 'login_success', $2, $3)`,
    [user.id, getClientIp(), getUserAgent()],
  );

  await query(`update users set last_login_at = now() where id = $1`, [user.id]);

  cookies().set(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return { ok: true, userId: user.id };
}

export async function logout(): Promise<void> {
  const sid = cookies().get(SESSION_COOKIE)?.value;
  if (sid) {
    await query(`delete from sessions where id = $1`, [hashSessionId(sid)]);
  }
  cookies().delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const sid = cookies().get(SESSION_COOKIE)?.value;
  if (!sid) return null;

  const row = await one<{
    user_id: string;
    org_id: string;
    username: string;
    full_name: string;
    email: string | null;
    user_type: string | null;
    home_branch_id: string | null;
    expires_at: string;
  }>(
    `select s.user_id, u.org_id, u.username, u.full_name, u.email, u.user_type, u.home_branch_id, s.expires_at
     from sessions s
     join users u on u.id = s.user_id
     where s.id = $1 and s.expires_at > now() and u.is_active`,
    [hashSessionId(sid)],
  );

  if (!row) return null;

  const branches = await many<{ branch_id: string }>(
    `select branch_id from user_branches where user_id = $1`,
    [row.user_id],
  );

  await query(`update sessions set last_seen_at = now() where id = $1`, [hashSessionId(sid)]);

  return {
    userId: row.user_id,
    orgId: row.org_id,
    username: row.username,
    fullName: row.full_name,
    email: row.email,
    userType: row.user_type,
    homeBranchId: row.home_branch_id,
    branchIds: branches.map((b) => b.branch_id),
  };
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error('Unauthenticated');
  return session;
}

function getClientIp(): string | null {
  const h = headers();
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return h.get('x-real-ip');
}

function getUserAgent(): string | null {
  return headers().get('user-agent');
}
