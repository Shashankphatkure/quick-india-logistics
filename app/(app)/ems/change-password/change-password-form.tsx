'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as CompactButton from '@/components/ui/compact-button';
import { RiLockLine, RiEyeLine, RiEyeOffLine } from '@remixicon/react';
import { changePasswordAction } from './actions';

export default function ChangePasswordForm({ username }: { username: string }) {
  const [show, setShow] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await changePasswordAction(fd);
      if (r.ok) {
        toast.success('Password changed successfully');
        (e.target as HTMLFormElement).reset();
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <div className="flex justify-center pt-4 pb-8">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-md sm:p-6 space-y-4"
      >
        <div className="mb-2 flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-alpha-10">
            <RiLockLine size={22} className="text-primary-base" />
          </div>
          <h2 className="text-label-sm font-bold text-text-strong-950">Change Password</h2>
          <p className="text-paragraph-xs text-text-sub-600">Signed in as <span className="font-mono">{username}</span></p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label.Root>Current Password</Label.Root>
          <Input.Root size="medium">
            <Input.Wrapper>
              <Input.Input
                name="currentPassword"
                type={show ? 'text' : 'password'}
                placeholder="Enter current password"
                autoComplete="current-password"
                required
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label.Root>New Password</Label.Root>
          <Input.Root size="medium">
            <Input.Wrapper>
              <Input.Input
                name="newPassword"
                type={show ? 'text' : 'password'}
                placeholder="Min 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
              />
              <Input.Affix>
                <CompactButton.Root
                  variant="ghost"
                  size="medium"
                  type="button"
                  onClick={() => setShow((p) => !p)}
                >
                  <CompactButton.Icon as={show ? RiEyeOffLine : RiEyeLine} />
                </CompactButton.Root>
              </Input.Affix>
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label.Root>Confirm New Password</Label.Root>
          <Input.Root size="medium">
            <Input.Wrapper>
              <Input.Input
                name="confirmPassword"
                type={show ? 'text' : 'password'}
                placeholder="Repeat new password"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        {error && <p className="text-paragraph-sm text-error-base">{error}</p>}

        <Button.Root className="w-full" type="submit" disabled={pending}>
          {pending ? 'Updating...' : 'Change Password'}
        </Button.Root>
      </form>
    </div>
  );
}
