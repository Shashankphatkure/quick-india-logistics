'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import Sidebar from './sidebar';
import AppHeader from './app-header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
      <AppHeader sidebarCollapsed={collapsed} onMenuToggle={() => setCollapsed((p) => !p)} />
      <div
        className={cn(
          'min-h-screen bg-bg-weak-50 pt-14 transition-all duration-300',
          collapsed ? 'pl-[60px]' : 'pl-[232px]',
        )}
      >
        <main className="p-6">{children}</main>
      </div>
    </>
  );
}
