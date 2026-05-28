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
