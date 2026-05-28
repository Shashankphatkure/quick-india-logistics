'use server';

import { revalidatePath } from 'next/cache';
import { createUser } from '@/lib/db/users';
import { currentOrgId } from '@/lib/tenant';
import { query } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export type AddUserResult = { ok: true } | { ok: false; error: string };

const USER_TYPES = new Set(['employee', 'manager', 'admin', 'super_admin']);
const CHANNELS = new Set(['web', 'mobile', 'web_and_mobile']);

export async function addUserAction(formData: FormData): Promise<AddUserResult> {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const userType = String(formData.get('userType') ?? 'employee');
  const channelAccess = String(formData.get('channelAccess') ?? 'web');
  const departmentId = String(formData.get('departmentId') ?? '').trim();
  const designationId = String(formData.get('designationId') ?? '').trim();
  const homeBranchId = String(formData.get('homeBranchId') ?? '').trim();

  if (!username) return { ok: false, error: 'Username is required' };
  if (!fullName) return { ok: false, error: 'Full name is required' };
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters' };
  if (!USER_TYPES.has(userType)) return { ok: false, error: 'Invalid user type' };
  if (!CHANNELS.has(channelAccess)) return { ok: false, error: 'Invalid channel' };

  try {
    await createUser({
      orgId: await currentOrgId(),
      username,
      password,
      fullName,
      email: email || null,
      phone: phone || null,
      userType: userType as 'employee' | 'manager' | 'admin' | 'super_admin',
      channelAccess: channelAccess as 'web' | 'mobile' | 'web_and_mobile',
      departmentId: departmentId || null,
      designationId: designationId || null,
      homeBranchId: homeBranchId || null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('users_username_per_org_uq')) {
      return { ok: false, error: 'A user with this username already exists' };
    }
    return { ok: false, error: msg };
  }

  revalidatePath('/ems/users');
  return { ok: true };
}

export async function bulkDeactivateUsersAction(ids: string[]): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  if (ids.length === 0) return { ok: false, error: 'Nothing selected' };
  // Protect self
  const safeIds = ids.filter((id) => id !== session.userId);
  if (safeIds.length === 0) return { ok: false, error: 'Cannot deactivate yourself' };
  try {
    await query(`update users set is_active = false where id = any($1::uuid[]) and org_id = $2`, [safeIds, await currentOrgId()]);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
  revalidatePath('/ems/users');
  return { ok: true };
}

export async function bulkActivateUsersAction(ids: string[]): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireSession();
  if (ids.length === 0) return { ok: false, error: 'Nothing selected' };
  try {
    await query(`update users set is_active = true where id = any($1::uuid[]) and org_id = $2`, [ids, await currentOrgId()]);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' };
  }
  revalidatePath('/ems/users');
  return { ok: true };
}
