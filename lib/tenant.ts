import 'server-only';
import { getSession } from '@/lib/auth';

export const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function currentOrgId(): Promise<string> {
  const session = await getSession();
  return session?.orgId ?? DEFAULT_ORG_ID;
}

export async function currentBranchIds(): Promise<string[]> {
  const session = await getSession();
  return session?.branchIds ?? [];
}

export type TenantScope = {
  orgId: string;
  /**
   * Branch restriction for operational (shipment) data.
   * - `null`  → see ALL branches in the org (super_admin / admin)
   * - `string[]` → restricted to these branch IDs (manager / employee)
   * - `[]` (empty) → user has no branch assignment → sees nothing (safe default)
   */
  branchIds: string[] | null;
};

/**
 * Resolve the current user's data scope. Org admins see everything;
 * branch staff are restricted to the branches in their `user_branches`.
 * Operational list queries (orders, manifests, runsheets, deliveries,
 * ewaybill, assets) should pass `scope.branchIds` to the lib/db helpers.
 * Master data (commodities, vendors, vehicles, branches…) is org-wide and
 * is NOT branch-scoped.
 */
export async function tenantScope(): Promise<TenantScope> {
  const session = await getSession();
  const orgId = session?.orgId ?? DEFAULT_ORG_ID;
  if (!session) return { orgId, branchIds: [] };
  if (session.userType === 'super_admin' || session.userType === 'admin') {
    return { orgId, branchIds: null };
  }
  // Branch staff: union explicit user_branches with their home branch, so a user
  // who only has a home branch set (no explicit assignments) still sees their branch.
  const set = new Set<string>(session.branchIds ?? []);
  if (session.homeBranchId) set.add(session.homeBranchId);
  return { orgId, branchIds: Array.from(set) };
}
