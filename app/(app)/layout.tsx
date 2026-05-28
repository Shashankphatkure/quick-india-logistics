import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import AppShell from '@/components/app-shell';
import FeedbackWidget from '@/components/feedback-widget/feedback-widget';
import { getSession } from '@/lib/auth';
import { canAccessPath, type UserType } from '@/lib/permissions';
import { many, one } from '@/lib/db';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const pathname = headers().get('x-pathname') ?? '';
  if (pathname && !canAccessPath(session.userType as UserType | null, pathname)) {
    redirect('/dashboard?denied=1');
  }

  // Fetch the user's accessible branches + the home branch name for the header dropdown.
  const branches = session.branchIds.length > 0
    ? await many<{ id: string; name: string }>(
        `select id, name from branches where org_id = $1 and id = any($2::uuid[]) and is_active order by name`,
        [session.orgId, session.branchIds],
      )
    : [];
  const currentBranch = session.homeBranchId
    ? await one<{ name: string }>(`select name from branches where id = $1`, [session.homeBranchId])
    : branches[0] ?? null;

  return (
    <>
      <AppShell
        user={{
          fullName: session.fullName,
          username: session.username,
          userType: (session.userType as UserType | null) ?? 'employee',
        }}
        branches={branches}
        currentBranchName={currentBranch?.name}
      >
        {children}
      </AppShell>
      <FeedbackWidget user={{
        id: session.userId,
        fullName: session.fullName,
        email: session.email,
        userType: session.userType,
      }} />
    </>
  );
}
