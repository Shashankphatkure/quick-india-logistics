'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { RiEyeLine, RiEyeOffLine, RiTruckLine, RiCheckLine } from '@remixicon/react';

const STEPS = ['Account', 'Profile', 'Organization'];

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg-weak-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[380px] lg:flex-col lg:justify-between bg-[#0c1322] p-10">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary-base">
            <RiTruckLine size={18} className="text-white" />
          </div>
          <span className="text-label-md font-bold text-white">LogiCore</span>
        </div>

        <div className="space-y-5">
          <p className="text-subheading-xs uppercase tracking-wider text-white/40">Getting Started</p>
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition ${
                i < step ? 'bg-success-base text-white'
                : i === step ? 'bg-primary-base text-white'
                : 'bg-white/10 text-white/40'
              }`}>
                {i < step ? <RiCheckLine size={13} /> : i + 1}
              </div>
              <span className={`text-paragraph-sm font-medium ${i <= step ? 'text-white' : 'text-white/40'}`}>{s}</span>
            </div>
          ))}
        </div>

        <p className="text-paragraph-xs text-white/25">&copy; 2026 LogiCore. All rights reserved.</p>
      </div>

      {/* Right form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-1.5">
            <h1 className="text-title-h5 font-bold text-text-strong-950">Create your account</h1>
            <p className="text-paragraph-sm text-text-sub-600">Step {step + 1} of {STEPS.length} &mdash; {STEPS[step]}</p>
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label.Root>Username <Label.Asterisk /></Label.Root>
                <Input.Root size="medium"><Input.Wrapper><Input.Input placeholder="Choose a username" /></Input.Wrapper></Input.Root>
              </div>
              <div className="space-y-1.5">
                <Label.Root>Email address <Label.Asterisk /></Label.Root>
                <Input.Root size="medium"><Input.Wrapper><Input.Input type="email" placeholder="you@company.com" /></Input.Wrapper></Input.Root>
              </div>
              <div className="space-y-1.5">
                <Label.Root>Password <Label.Asterisk /></Label.Root>
                <Input.Root size="medium">
                  <Input.Wrapper>
                    <Input.Input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" />
                    <Input.Affix>
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="text-text-sub-600 hover:text-text-strong-950 transition" tabIndex={-1}>
                        {showPassword ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                      </button>
                    </Input.Affix>
                  </Input.Wrapper>
                </Input.Root>
              </div>
              <div className="space-y-1.5">
                <Label.Root>Confirm password <Label.Asterisk /></Label.Root>
                <Input.Root size="medium"><Input.Wrapper><Input.Input type="password" placeholder="Re-enter password" /></Input.Wrapper></Input.Root>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label.Root>First Name <Label.Asterisk /></Label.Root>
                  <Input.Root size="medium"><Input.Wrapper><Input.Input placeholder="First name" /></Input.Wrapper></Input.Root>
                </div>
                <div className="space-y-1.5">
                  <Label.Root>Last Name <Label.Asterisk /></Label.Root>
                  <Input.Root size="medium"><Input.Wrapper><Input.Input placeholder="Last name" /></Input.Wrapper></Input.Root>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label.Root>Phone Number <Label.Asterisk /></Label.Root>
                <Input.Root size="medium"><Input.Wrapper><Input.Input type="tel" placeholder="+91 98765 43210" /></Input.Wrapper></Input.Root>
              </div>
              <div className="space-y-1.5">
                <Label.Root>Date of Birth</Label.Root>
                <Input.Root size="medium"><Input.Wrapper><Input.Input type="date" /></Input.Wrapper></Input.Root>
              </div>
              <div className="space-y-1.5">
                <Label.Root>Gender</Label.Root>
                <div className="flex gap-5 pt-1">
                  {['Male', 'Female', 'Other'].map(g => (
                    <label key={g} className="flex cursor-pointer items-center gap-2 text-paragraph-sm text-text-strong-950">
                      <input type="radio" name="gender" value={g} className="accent-primary-base" />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label.Root>Organization <Label.Asterisk /></Label.Root>
                <Select.Root size="medium">
                  <Select.Trigger><Select.Value placeholder="Select organization" /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="qil">Quick India Logistics Pvt Ltd</Select.Item>
                  </Select.Content>
                </Select.Root>
              </div>
              <div className="space-y-1.5">
                <Label.Root>Home Branch <Label.Asterisk /></Label.Root>
                <Select.Root size="medium">
                  <Select.Trigger><Select.Value placeholder="Select branch" /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="amritsar">QIL-AMRITSAR</Select.Item>
                    <Select.Item value="delhi">QIL-NEW-DELHI</Select.Item>
                    <Select.Item value="mumbai">QIL-MUMBAI</Select.Item>
                    <Select.Item value="bengaluru">QIL-BENGALURU</Select.Item>
                  </Select.Content>
                </Select.Root>
              </div>
              <div className="space-y-1.5">
                <Label.Root>Department <Label.Asterisk /></Label.Root>
                <Select.Root size="medium">
                  <Select.Trigger><Select.Value placeholder="Select department" /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="data-entry">Data Entry</Select.Item>
                    <Select.Item value="operations">Operations</Select.Item>
                    <Select.Item value="admin">Admin</Select.Item>
                    <Select.Item value="customer-support">Customer Support</Select.Item>
                    <Select.Item value="software">Software</Select.Item>
                  </Select.Content>
                </Select.Root>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {step > 0 && (
              <Button.Root variant="neutral" mode="stroke" className="flex-1" onClick={() => setStep(p => p - 1)}>
                Back
              </Button.Root>
            )}
            {step < STEPS.length - 1 ? (
              <Button.Root className="flex-1" onClick={() => setStep(p => p + 1)}>Continue</Button.Root>
            ) : (
              <Button.Root className="flex-1">Create Account</Button.Root>
            )}
          </div>

          <p className="text-center text-paragraph-sm text-text-sub-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary-base no-underline hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
