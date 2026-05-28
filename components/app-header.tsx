'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/utils/cn';
import * as Input from '@/components/ui/input';
import * as Avatar from '@/components/ui/avatar';
import * as Dropdown from '@/components/ui/dropdown';
import {
  RiSearchLine,
  RiRefreshLine,
  RiMapPinLine,
  RiArrowDownSLine,
  RiUserLine,
  RiSettings3Line,
  RiLogoutBoxLine,
  RiMenuLine,
} from '@remixicon/react';

const ThemeSwitch = dynamic(() => import('./theme-switch'), { ssr: false });

import { logoutAction } from '@/app/(auth)/login/actions';
import type { AppShellUser } from './app-shell';

interface AppHeaderProps {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
  user?: AppShellUser;
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function AppHeader({ onMenuToggle, sidebarCollapsed, user }: AppHeaderProps) {
  const displayName = user?.fullName?.split(' ')[0] ?? 'User';
  const initialsText = user ? initials(user.fullName) : 'U';
  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-30 flex h-14 items-center gap-2 border-b border-stroke-soft-200 bg-bg-white-0 px-3 transition-all duration-300 sm:gap-3 sm:px-4',
        'left-0',
        sidebarCollapsed ? 'lg:left-16' : 'lg:left-60',
      )}
    >
      {/* Hamburger for mobile / tablet */}
      <button
        onClick={onMenuToggle}
        aria-label="Toggle menu"
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition hover:bg-bg-weak-50 hover:text-text-strong-950 lg:hidden"
      >
        <RiMenuLine size={18} />
      </button>

      {/* Docket search */}
      <div className="min-w-0 flex-1">
        <Input.Root size="small">
          <Input.Wrapper>
            <Input.Icon as={RiSearchLine} />
            <Input.Input placeholder="Enter Docket No" />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {/* Branch selector */}
        <Dropdown.Root>
          <Dropdown.Trigger asChild>
            <button className="flex items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2 py-1.5 text-paragraph-xs font-medium text-text-strong-950 shadow-regular-xs transition hover:bg-bg-weak-50 sm:px-3">
              <RiMapPinLine size={13} className="text-primary-base" />
              <span className="hidden sm:inline">QIL-AMRITSAR</span>
              <RiArrowDownSLine size={13} className="text-text-sub-600" />
            </button>
          </Dropdown.Trigger>
          <Dropdown.Content align="end" className="w-52">
            {['QIL-AMRITSAR', 'QIL-NEW-DELHI', 'QIL-MUMBAI', 'QIL-BENGALURU'].map((b) => (
              <Dropdown.Item key={b} className="text-paragraph-sm">
                <RiMapPinLine size={13} />
                {b}
              </Dropdown.Item>
            ))}
          </Dropdown.Content>
        </Dropdown.Root>

        {/* Refresh */}
        <button
          aria-label="Refresh"
          className="hidden size-8 items-center justify-center rounded-lg text-text-sub-600 transition hover:bg-bg-weak-50 hover:text-text-strong-950 sm:flex"
        >
          <RiRefreshLine size={16} />
        </button>

        {/* Theme switcher */}
        <div className="hidden sm:block">
          <ThemeSwitch />
        </div>

        {/* User dropdown */}
        <Dropdown.Root>
          <Dropdown.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-bg-weak-50 sm:px-2">
              <Avatar.Root size="24" color="blue">
                {initialsText}
              </Avatar.Root>
              <span className="hidden text-paragraph-sm font-medium text-text-strong-950 sm:block">
                {displayName}
              </span>
              <RiArrowDownSLine size={13} className="hidden text-text-sub-600 sm:block" />
            </button>
          </Dropdown.Trigger>
          <Dropdown.Content align="end" className="w-48">
            <Dropdown.Item>
              <Dropdown.ItemIcon as={RiUserLine} />
              Profile
            </Dropdown.Item>
            <Dropdown.Item>
              <Dropdown.ItemIcon as={RiSettings3Line} />
              Settings
            </Dropdown.Item>
            <Dropdown.Separator />
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-paragraph-sm text-error-base transition hover:bg-error-lighter"
              >
                <RiLogoutBoxLine size={14} />
                Log out
              </button>
            </form>
          </Dropdown.Content>
        </Dropdown.Root>
      </div>
    </header>
  );
}
