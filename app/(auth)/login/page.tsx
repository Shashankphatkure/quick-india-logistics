'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import { Root as Checkbox } from '@/components/ui/checkbox';
import { RiEyeLine, RiEyeOffLine, RiTruckLine, RiLockLine, RiUserLine, RiShieldLine } from '@remixicon/react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg-weak-50">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[420px] lg:flex-col lg:justify-between bg-[#0c1322] p-10">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary-base">
            <RiTruckLine size={18} className="text-white" />
          </div>
          <span className="text-label-md font-bold text-white">LogiCore</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            {[
              { icon: RiShieldLine, text: 'Role-based access control with granular permissions per module' },
              { icon: RiTruckLine, text: 'Real-time shipment tracking across all branches' },
              { icon: RiLockLine, text: 'Cold chain asset management with calibration records' },
            ].map(f => (
              <div key={f.text} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary-alpha-24">
                  <f.icon size={13} className="text-primary-base" />
                </div>
                <p className="text-paragraph-sm text-white/60 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
          <p className="text-paragraph-xs text-white/25">&copy; 2026 LogiCore. All rights reserved.</p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#0c1322]">
              <RiTruckLine size={18} className="text-white" />
            </div>
            <span className="text-label-md font-bold text-text-strong-950">LogiCore</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-title-h5 font-bold text-text-strong-950">Welcome back</h1>
            <p className="text-paragraph-sm text-text-sub-600">Sign in to your LogiCore account to continue</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label.Root htmlFor="username">Username</Label.Root>
              <Input.Root size="medium">
                <Input.Wrapper>
                  <Input.Icon as={RiUserLine} />
                  <Input.Input id="username" placeholder="Enter your username" autoComplete="username" />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label.Root htmlFor="password">Password</Label.Root>
                <Link href="/forgot-password" className="text-paragraph-xs font-medium text-primary-base no-underline hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input.Root size="medium">
                <Input.Wrapper>
                  <Input.Icon as={RiLockLine} />
                  <Input.Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <Input.Affix>
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="flex items-center justify-center text-text-sub-600 transition hover:text-text-strong-950"
                      tabIndex={-1}
                    >
                      {showPassword ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                    </button>
                  </Input.Affix>
                </Input.Wrapper>
              </Input.Root>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5">
              <Checkbox checked={remember} onCheckedChange={v => setRemember(!!v)} />
              <span className="text-paragraph-sm text-text-sub-600">Remember me for 30 days</span>
            </label>

            <Button.Root className="w-full" size="medium">Sign In</Button.Root>
          </div>

          <p className="text-center text-paragraph-sm text-text-sub-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary-base no-underline hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
