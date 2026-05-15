'use client';

import React from 'react';
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

interface AppHeaderProps {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

export default function AppHeader({ onMenuToggle, sidebarCollapsed }: AppHeaderProps) {
  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-stroke-soft-200 bg-bg-white-0 px-4 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-60',
      )}
    >
      {/* Hamburger for mobile */}
      <button
        onClick={onMenuToggle}
        className="flex size-8 items-center justify-center rounded-lg text-text-sub-600 transition hover:bg-bg-weak-50 hover:text-text-strong-950 md:hidden"
      >
        <RiMenuLine size={18} />
      </button>

      {/* Docket search */}
      <div className="w-56">
        <Input.Root size="sm">
          <Input.Wrapper>
            <Input.Icon as={RiSearchLine} />
            <Input.Input placeholder="Enter Docket No" />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        {/* Branch selector */}
        <Dropdown.Root>
          <Dropdown.Trigger asChild>
            <button className="flex items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 text-xs font-medium text-text-strong-950 shadow-regular-xs transition hover:bg-bg-weak-50">
              <RiMapPinLine size={13} className="text-primary-base" />
              QIL-AMRITSAR
              <RiArrowDownSLine size={13} className="text-text-sub-600" />
            </button>
          </Dropdown.Trigger>
          <Dropdown.Content align="end" className="w-52">
            {['QIL-AMRITSAR', 'QIL-NEW-DELHI', 'QIL-MUMBAI', 'QIL-BENGALURU'].map((b) => (
              <Dropdown.Item key={b} className="text-xs">
                <RiMapPinLine size={13} />
                {b}
              </Dropdown.Item>
            ))}
          </Dropdown.Content>
        </Dropdown.Root>

        {/* Refresh */}
        <button className="flex size-8 items-center justify-center rounded-lg text-text-sub-600 transition hover:bg-bg-weak-50 hover:text-text-strong-950">
          <RiRefreshLine size={16} />
        </button>

        {/* User dropdown */}
        <Dropdown.Root>
          <Dropdown.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-bg-weak-50">
              <Avatar.Root size="24" color="blue">
                GN
              </Avatar.Root>
              <span className="hidden text-xs font-medium text-text-strong-950 sm:block">
                Ganesh
              </span>
              <RiArrowDownSLine size={13} className="text-text-sub-600" />
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
            <Dropdown.Item className="text-state-error-base">
              <Dropdown.ItemIcon as={RiLogoutBoxLine} />
              Log out
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Root>
      </div>
    </header>
  );
}
