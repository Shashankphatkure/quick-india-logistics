import 'server-only';
import { many, one } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export type UserRow = {
  id: string;
  username: string;
  email: string | null;
  full_name: string;
  phone: string | null;
  user_type: string | null;
  channel_access: string | null;
  department_id: string | null;
  designation_id: string | null;
  home_branch_id: string | null;
  department_name: string | null;
  designation_name: string | null;
  home_branch_name: string | null;
  is_active: boolean;
  last_login_at: string | null;
};

export type UserCounts = {
  total: number;
  active: number;
  admins: number;
  managers: number;
};

export async function listUsers(opts: {
  orgId: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<UserRow[]> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, opts.pageSize ?? 25);
  return many<UserRow>(
    `select
       u.id, u.username, u.email, u.full_name, u.phone, u.user_type, u.channel_access,
       u.department_id, u.designation_id, u.home_branch_id,
       d.name as department_name,
       g.name as designation_name,
       b.name as home_branch_name,
       u.is_active, u.last_login_at
     from users u
     left join departments d on d.id = u.department_id
     left join designations g on g.id = u.designation_id
     left join branches b on b.id = u.home_branch_id
     where u.org_id = $1
       and ($2::text is null or u.full_name ilike '%' || $2 || '%' or u.username ilike '%' || $2 || '%' or u.email ilike '%' || $2 || '%')
     order by u.full_name
     limit $3 offset $4`,
    [opts.orgId, opts.search ?? null, pageSize, (page - 1) * pageSize],
  );
}

export async function countUsers(opts: { orgId: string; search?: string }): Promise<number> {
  const r = await one<{ n: string }>(
    `select count(*)::text as n from users
     where org_id = $1 and ($2::text is null or full_name ilike '%' || $2 || '%' or username ilike '%' || $2 || '%' or email ilike '%' || $2 || '%')`,
    [opts.orgId, opts.search ?? null],
  );
  return Number(r?.n ?? 0);
}

export async function getUserCounts(orgId: string): Promise<UserCounts> {
  const r = await one<{ total: string; active: string; admins: string; managers: string }>(
    `select
       count(*)::text as total,
       count(*) filter (where is_active)::text as active,
       count(*) filter (where user_type in ('admin', 'super_admin'))::text as admins,
       count(*) filter (where user_type = 'manager')::text as managers
     from users where org_id = $1`,
    [orgId],
  );
  return {
    total: Number(r?.total ?? 0),
    active: Number(r?.active ?? 0),
    admins: Number(r?.admins ?? 0),
    managers: Number(r?.managers ?? 0),
  };
}

export type CreateUserInput = {
  orgId: string;
  username: string;
  password: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  userType?: 'employee' | 'manager' | 'admin' | 'super_admin';
  channelAccess?: 'web' | 'mobile' | 'web_and_mobile';
  departmentId?: string | null;
  designationId?: string | null;
  homeBranchId?: string | null;
};

export async function createUser(input: CreateUserInput): Promise<string> {
  const passwordHash = await hashPassword(input.password);
  const r = await one<{ id: string }>(
    `insert into users (
       org_id, username, password_hash, full_name, email, phone,
       user_type, channel_access, department_id, designation_id, home_branch_id,
       must_change_pw
     ) values (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9, $10, $11,
       true
     ) returning id`,
    [
      input.orgId,
      input.username.trim(),
      passwordHash,
      input.fullName.trim(),
      input.email ?? null,
      input.phone ?? null,
      input.userType ?? 'employee',
      input.channelAccess ?? 'web',
      input.departmentId ?? null,
      input.designationId ?? null,
      input.homeBranchId ?? null,
    ],
  );
  if (!r) throw new Error('Insert failed');
  return r.id;
}

export async function listDepartmentsForSelect(orgId: string) {
  return many<{ id: string; name: string }>(
    `select id, name from departments where org_id = $1 and is_active order by name`,
    [orgId],
  );
}

export async function listDesignationsForSelect(orgId: string) {
  return many<{ id: string; name: string }>(
    `select id, name from designations where org_id = $1 and is_active order by name`,
    [orgId],
  );
}
