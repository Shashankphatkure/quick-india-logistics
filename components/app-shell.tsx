'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import Sidebar from './sidebar';
import AppHeader from './app-header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Desktop: collapse to icon rail. Mobile: off-canvas drawer.
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden
        className={cn(
          'fixed inset-0 z-40 bg-overlay backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((p) => !p)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <AppHeader
        sidebarCollapsed={collapsed}
        onMenuToggle={() => setMobileOpen((p) => !p)}
      />

      <div
        className={cn(
          'min-h-screen bg-bg-weak-50 pt-14 transition-all duration-300',
          collapsed ? 'lg:pl-16' : 'lg:pl-60',
        )}
      >
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </>
  );
}
