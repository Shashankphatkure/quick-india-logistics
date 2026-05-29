'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { currentOrgId } from '@/lib/tenant';
import { one, query } from '@/lib/db';

export type SetBranchResult = { ok: true } | { ok: false; error: string };

/**
 * Switch the active branch context by updating the user's home branch.
 * Drives the dashboard "Summary for <branch>" view and the Incoming
 * manifest/runsheet pages. Validated against the org (and, for branch
 * staff, against their assigned branches).
 */
export async function setHomeBranchAction(branchId: string): Promise<SetBranchResult> {
  const session = await requireSession();
  const orgId = await currentOrgId();
  if (!branchId) return { ok: false, error: 'Branch required' };

  const branch = await one<{ id: string }>(
    `select id from branches where id=$1 and org_id=$2 and is_active`,
    [branchId, orgId],
  );
  if (!branch) return { ok: false, error: 'Branch not found' };

  // Branch staff may only switch among their assigned branches (+ current home).
  const isAdmin = session.userType === 'super_admin' || session.userType === 'admin';
  if (!isAdmin) {
    const allowed = new Set([...(session.branchIds ?? [])]);
    if (session.homeBranchId) allowed.add(session.homeBranchId);
    if (!allowed.has(branchId)) return { ok: false, error: 'Not assigned to that branch' };
  }

  await query(`update users set home_branch_id=$1 where id=$2`, [branchId, session.userId]);
  revalidatePath('/', 'layout');
  return { ok: true };
}
