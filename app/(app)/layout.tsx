import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import AppShell from '@/components/app-shell';
import { getSession } from '@/lib/auth';
import { canAccessPath, type UserType } from '@/lib/permissions';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  // Role gate: read the request path from middleware-injected header,
  // fall back to allowing through if we can't determine it.
  const pathname = headers().get('x-pathname') ?? '';
  if (pathname && !canAccessPath(session.userType as UserType | null, pathname)) {
    redirect('/dashboard?denied=1');
  }

  return (
    <AppShell
      user={{
        fullName: session.fullName,
        username: session.username,
        userType: (session.userType as UserType | null) ?? 'employee',
      }}
    >
      {children}
    </AppShell>
  );
}
