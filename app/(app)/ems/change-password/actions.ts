'use server';

import { revalidatePath } from 'next/cache';
import { requireSession, hashPassword, verifyPassword } from '@/lib/auth';
import { one, query } from '@/lib/db';

export type ChangePwResult = { ok: true } | { ok: false; error: string };

export async function changePasswordAction(formData: FormData): Promise<ChangePwResult> {
  const session = await requireSession();
  const current = String(formData.get('currentPassword') ?? '');
  const next = String(formData.get('newPassword') ?? '');
  const confirm = String(formData.get('confirmPassword') ?? '');

  if (!current) return { ok: false, error: 'Current password is required' };
  if (next.length < 8) return { ok: false, error: 'New password must be at least 8 characters' };
  if (next !== confirm) return { ok: false, error: 'New password and confirm do not match' };
  if (next === current) return { ok: false, error: 'New password must differ from current' };

  const u = await one<{ password_hash: string | null }>(
    `select password_hash from users where id = $1`,
    [session.userId],
  );
  if (!u || !u.password_hash) return { ok: false, error: 'User not found' };

  const ok = await verifyPassword(current, u.password_hash);
  if (!ok) return { ok: false, error: 'Current password is incorrect' };

  const hash = await hashPassword(next);
  await query(
    `update users set password_hash = $1, must_change_pw = false where id = $2`,
    [hash, session.userId],
  );

  revalidatePath('/ems/change-password');
  return { ok: true };
}
