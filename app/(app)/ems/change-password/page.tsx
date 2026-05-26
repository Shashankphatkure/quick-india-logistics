'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as CompactButton from '@/components/ui/compact-button';
import PageHeader from '@/components/page-header';
import { RiLockLine, RiEyeLine, RiEyeOffLine, RiKeyLine } from '@remixicon/react';
import { cn } from '@/utils/cn';

const EMS_TABS = [
  { label: 'Login Details', href: '/ems/login-details' },
  { label: 'Permission', href: '/ems/permissions' },
  { label: 'Users', href: '/ems/users' },
  { label: 'Departments', href: '/ems/departments' },
  { label: 'Designations', href: '/ems/designations' },
  { label: 'Change Password', href: '/ems/change-password' },
];

export default function ChangePasswordPage() {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader
        icon={RiKeyLine}
        iconColor="bg-primary-lighter text-primary-base"
        title="Change Password"
        subtitle="Reset user account password"
        breadcrumbs={[{ label: 'EMS', href: '/ems/users' }, { label: 'Change Password' }]}
      />

      {/* EMS sub-tabs */}
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

      <div className="flex justify-center pt-4 pb-8">
        <div className="w-full max-w-sm rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-md sm:p-6">
          <div className="mb-5 flex flex-col items-center gap-2">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-lighter">
              <RiLockLine size={22} className="text-primary-base" />
            </div>
            <h2 className="text-label-sm font-bold text-text-strong-950">Password Reset</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label.Root>Enter Username</Label.Root>
              <Input.Root size="medium">
                <Input.Wrapper>
                  <Input.Input placeholder="Enter User_name" />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label.Root>Enter New Password</Label.Root>
              <Input.Root size="medium">
                <Input.Wrapper>
                  <Input.Input type={show ? 'text' : 'password'} placeholder="Enter New Password" />
                  <Input.Affix>
                    <CompactButton.Root
                      variant="ghost"
                      size="medium"
                      type="button"
                      onClick={() => setShow(p => !p)}
                    >
                      <CompactButton.Icon as={show ? RiEyeOffLine : RiEyeLine} />
                    </CompactButton.Root>
                  </Input.Affix>
                </Input.Wrapper>
              </Input.Root>
            </div>

            <Button.Root className="w-full">Change Password</Button.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
