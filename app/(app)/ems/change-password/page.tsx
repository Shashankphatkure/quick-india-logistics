'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import { RiLockLine, RiEyeLine, RiEyeOffLine } from '@remixicon/react';
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
      <div><h1 className="text-label-lg font-bold text-text-strong-950">EMS - Change Password</h1><p className="text-paragraph-xs text-text-sub-600">EMS / Change Password</p></div>
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {EMS_TABS.map(t => <Link key={t.href} href={t.href} className={cn('shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition', t.href === '/ems/change-password' ? 'bg-primary-base text-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>{t.label}</Link>)}
      </div>
      <div className="flex justify-center pt-4">
        <div className="w-full max-w-sm rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-regular-md">
          <div className="mb-5 flex flex-col items-center gap-2">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-lighter">
              <RiLockLine size={22} className="text-primary-base" />
            </div>
            <h2 className="text-paragraph-md font-bold text-text-strong-950">Password Reset</h2>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-paragraph-xs font-medium text-text-strong-950">Enter Username</label>
              <Input.Root size="medium"><Input.Wrapper><Input.Input placeholder="Enter User_name" /></Input.Wrapper></Input.Root>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-paragraph-xs font-medium text-text-strong-950">Enter New Password</label>
              <Input.Root size="medium">
                <Input.Wrapper>
                  <Input.Input type={show ? 'text' : 'password'} placeholder="Enter New Password" />
                  <Input.Affix>
                    <button type="button" onClick={() => setShow(p => !p)} className="text-text-sub-600 hover:text-text-strong-950">
                      {show ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                    </button>
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
