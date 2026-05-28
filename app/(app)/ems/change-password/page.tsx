import React from 'react';
import Link from 'next/link';
import PageHeader from '@/components/page-header';
import { RiKeyLine } from '@remixicon/react';
import { cn } from '@/utils/cn';
import { getSession } from '@/lib/auth';
import ChangePasswordForm from './change-password-form';

const EMS_TABS = [
  { label: 'Login Details', href: '/ems/login-details' },
  { label: 'Permission', href: '/ems/permissions' },
  { label: 'Users', href: '/ems/users' },
  { label: 'Departments', href: '/ems/departments' },
  { label: 'Designations', href: '/ems/designations' },
  { label: 'Change Password', href: '/ems/change-password' },
];

export default async function ChangePasswordPage() {
  const session = await getSession();

  return (
    <div className="space-y-4">
      <PageHeader
        icon={RiKeyLine}
        iconColor="bg-primary-alpha-10 text-primary-base"
        title="Change Password"
        subtitle="Update your account password"
        breadcrumbs={[{ label: 'EMS', href: '/ems/users' }, { label: 'Change Password' }]}
      />

      <div className="flex gap-0.5 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {EMS_TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium no-underline transition',
              t.href === '/ems/change-password'
                ? 'bg-primary-base text-static-white shadow-regular-xs'
                : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <ChangePasswordForm username={session?.username ?? ''} />
    </div>
  );
}
