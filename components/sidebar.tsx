'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import {
  RiDashboardLine,
  RiBuilding2Line,
  RiTeamLine,
  RiReceiptLine,
  RiDatabase2Line,
  RiTruckLine,
  RiCalendarCheckLine,
  RiListCheck2,
  RiFilePaperLine,
  RiLineChartLine,
  RiMore2Line,
  RiSearchEyeLine,
  RiCustomerServiceLine,
  RiArrowDownSLine,
  RiMenuLine,
  RiSidebarFoldLine,
  RiSettings4Line,
  RiLogoutBoxLine,
} from '@remixicon/react';

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavChild[];
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: RiDashboardLine },
      { label: 'Organization', href: '/organization', icon: RiBuilding2Line },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'EwayBill', href: '/ewaybill', icon: RiReceiptLine },
      {
        label: 'Booking',
        icon: RiCalendarCheckLine,
        children: [
          { label: 'Orders', href: '/booking/orders' },
          { label: 'Docket Issues', href: '/booking/docket-issues' },
          { label: 'Delivery Info', href: '/booking/delivery-info' },
        ],
      },
      {
        label: 'Runsheet',
        icon: RiListCheck2,
        children: [
          { label: 'Pending Delivery', href: '/runsheet/pending-delivery' },
          { label: 'Hub Dispatch', href: '/runsheet/hub-dispatch' },
          { label: 'Incoming Runsheet', href: '/runsheet/incoming' },
          { label: 'All Runsheet', href: '/runsheet/all' },
        ],
      },
      {
        label: 'Manifest',
        icon: RiFilePaperLine,
        children: [
          { label: 'Pending For Dispatch', href: '/manifest/pending-dispatch' },
          { label: 'Hub Dispatch', href: '/manifest/hub-dispatch' },
          { label: 'Forwarding Details', href: '/manifest/forwarding' },
          { label: 'Pending To Depart', href: '/manifest/pending-depart' },
          { label: 'Incoming Manifest', href: '/manifest/incoming' },
          { label: 'All Manifest', href: '/manifest/all' },
        ],
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        label: 'EMS',
        icon: RiTeamLine,
        children: [
          { label: 'Login Details', href: '/ems/login-details' },
          { label: 'Permission', href: '/ems/permissions' },
          { label: 'Users', href: '/ems/users' },
          { label: 'Departments', href: '/ems/departments' },
          { label: 'Designations', href: '/ems/designations' },
          { label: 'Change Password', href: '/ems/change-password' },
        ],
      },
      {
        label: 'Master',
        icon: RiDatabase2Line,
        children: [
          { label: 'Commodities', href: '/master/commodities' },
          { label: 'Charges', href: '/master/charges' },
          { label: 'Bill To', href: '/master/bill-to' },
          { label: 'Branches', href: '/master/branches' },
          { label: 'Locations', href: '/master/locations' },
          { label: 'Assets', href: '/master/assets' },
          { label: 'Routes', href: '/master/routes' },
          { label: 'Vendors', href: '/master/vendors' },
          { label: 'Vehicle', href: '/master/vehicles' },
        ],
      },
      {
        label: 'Analytics',
        icon: RiLineChartLine,
        children: [{ label: 'Reports', href: '/analytics/reports' }],
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        label: 'Miscellaneous',
        icon: RiMore2Line,
        children: [{ label: 'Notice Category', href: '/misc/notice-category' }],
      },
      {
        label: 'Enquiry',
        icon: RiSearchEyeLine,
        children: [{ label: 'Docket Movement', href: '/enquiry/docket-movement' }],
      },
      {
        label: 'Connect Us',
        icon: RiCustomerServiceLine,
        children: [
          { label: 'Service Request', href: '/connect-us/service-request' },
          { label: 'Report', href: '/connect-us/report' },
        ],
      },
    ],
  },
];

const ALL_ITEMS: NavItem[] = NAV_GROUPS.flatMap(g => g.items);

function NavSection({ item, pathname }: { item: NavItem; pathname: string }) {
  const isLeafActive = item.href
    ? pathname === item.href || pathname.startsWith(item.href + '/')
    : false;
  const isParentActive = item.children?.some(
    c => pathname === c.href || pathname.startsWith(c.href + '/'),
  );

  const [open, setOpen] = useState(isLeafActive || isParentActive || false);

  if (!item.children) {
    return (
      <Link
        href={item.href!}
        className={cn(
          'group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium no-underline transition-all duration-150',
          isLeafActive
            ? 'bg-white/[.12] text-white'
            : 'text-white/70 hover:bg-white/8 hover:text-white',
        )}
      >
        {isLeafActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary-base" />
        )}
        <item.icon
          size={15}
          className={cn('shrink-0', isLeafActive ? 'text-primary-base' : 'text-white/50')}
        />
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(p => !p)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
          isParentActive
            ? 'text-white bg-white/[.06]'
            : 'text-white/70 hover:bg-white/8 hover:text-white',
        )}
      >
        <item.icon
          size={15}
          className={cn('shrink-0', isParentActive ? 'text-primary-base' : 'text-white/50')}
        />
        <span className="flex-1 text-left">{item.label}</span>
        <RiArrowDownSLine
          size={14}
          className={cn(
            'shrink-0 text-white/40 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          open ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="relative ml-[23px] mt-0.5 flex flex-col border-l border-white/[.10] pb-1 pl-3">
          {item.children.map(child => {
            const childActive =
              pathname === child.href || pathname.startsWith(child.href + '/');
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-[12px] no-underline transition-all duration-100',
                  childActive
                    ? 'bg-primary-base/20 text-white font-semibold'
                    : 'font-medium text-white/55 hover:bg-white/[.06] hover:text-white/85',
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col bg-[#0c1322] transition-all duration-300',
        collapsed ? 'w-[60px]' : 'w-[232px]',
      )}
    >
      {/* ── Logo ── */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-white/[.07]',
          collapsed ? 'justify-center' : 'justify-between px-4',
        )}
      >
        {collapsed ? (
          <button
            onClick={onToggle}
            className="flex size-8 items-center justify-center rounded-xl bg-primary-base shadow-lg"
          >
            <RiTruckLine size={15} className="text-white" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary-base shadow-lg">
                <RiTruckLine size={15} className="text-white" />
              </div>
              <div>
                <p className="text-[13px] font-bold leading-none tracking-tight text-white">
                  LogiCore
                </p>
                <p className="mt-0.5 text-[10px] text-white/30">v1.0</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              title="Collapse sidebar"
              className="rounded-lg p-1.5 text-white/25 transition hover:bg-white/8 hover:text-white/70"
            >
              <RiSidebarFoldLine size={15} />
            </button>
          </>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {collapsed ? (
          <div className="flex flex-col items-center gap-0.5 px-2">
            {ALL_ITEMS.map(item => {
              const href = item.href ?? item.children?.[0]?.href ?? '/';
              const isActive = item.href
                ? pathname === item.href || pathname.startsWith(item.href + '/')
                : item.children?.some(
                    c => pathname === c.href || pathname.startsWith(c.href + '/'),
                  );
              return (
                <Link
                  key={item.label}
                  href={href}
                  title={item.label}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-lg no-underline transition-all',
                    isActive
                      ? 'bg-primary-base text-white'
                      : 'text-white/50 hover:bg-white/10 hover:text-white/85',
                  )}
                >
                  <item.icon size={17} />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-5 px-2">
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi} className="flex flex-col gap-0.5">
                {group.title && (
                  <p className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white/25">
                    {group.title}
                  </p>
                )}
                {group.items.map(item => (
                  <div key={item.label} className="relative">
                    <NavSection item={item} pathname={pathname} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* ── User footer ── */}
      <div
        className={cn(
          'shrink-0 border-t border-white/[.07]',
          collapsed ? 'p-2' : 'p-3',
        )}
      >
        {collapsed ? (
          <button
            onClick={onToggle}
            title="Expand sidebar"
            className="flex w-full items-center justify-center rounded-lg p-2 text-white/30 transition hover:bg-white/8 hover:text-white/70"
          >
            <RiMenuLine size={15} />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 rounded-xl bg-white/[.05] px-3 py-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-alpha-24 text-[11px] font-bold text-primary-base">
              GN
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold leading-none text-white/85">
                Ganesh
              </p>
              <p className="mt-0.5 truncate text-[10px] text-white/35">Admin Manager</p>
            </div>
            <div className="flex items-center gap-0.5">
              <Link
                href="/ems/change-password"
                title="Settings"
                className="rounded p-1 text-white/25 no-underline transition hover:bg-white/10 hover:text-white/70"
              >
                <RiSettings4Line size={13} />
              </Link>
              <Link
                href="/login"
                title="Sign out"
                className="rounded p-1 text-white/25 no-underline transition hover:bg-white/10 hover:text-white/70"
              >
                <RiLogoutBoxLine size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
