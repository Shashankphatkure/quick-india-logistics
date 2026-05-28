import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import AppShell from '@/components/app-shell';
import FeedbackWidget from '@/components/feedback-widget/feedback-widget';
import { getSession } from '@/lib/auth';
import { canAccessPath, type UserType } from '@/lib/permissions';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const pathname = headers().get('x-pathname') ?? '';
  if (pathname && !canAccessPath(session.userType as UserType | null, pathname)) {
    redirect('/dashboard?denied=1');
  }

  return (
    <>
      <AppShell
        user={{
          fullName: session.fullName,
          username: session.username,
          userType: (session.userType as UserType | null) ?? 'employee',
        }}
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
