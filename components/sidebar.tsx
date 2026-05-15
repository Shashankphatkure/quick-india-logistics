'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import {
  RiDashboardLine,
  RiBuilding2Line,
  RiTeamLine,
  RiLoginBoxLine,
  RiShieldLine,
  RiUserLine,
  RiGroupLine,
  RiBriefcaseLine,
  RiLockLine,
  RiReceiptLine,
  RiDatabase2Line,
  RiBoxLine,
  RiMoneyDollarCircleLine,
  RiFileTextLine,
  RiMapPinLine,
  RiMapLine,
  RiToolsLine,
  RiRouteLine,
  RiTruckLine,
  RiCarLine,
  RiCalendarCheckLine,
  RiAlertLine,
  RiInformationLine,
  RiListCheck2,
  RiSendPlaneLine,
  RiFilePaperLine,
  RiArrowRightUpLine,
  RiFlightTakeoffLine,
  RiFlightLandLine,
  RiFileListLine,
  RiLineChartLine,
  RiBarChartLine,
  RiMore2Line,
  RiBellLine,
  RiSearchEyeLine,
  RiExchangeLine,
  RiCustomerServiceLine,
  RiArrowDownSLine,
  RiMenuLine,
  RiCloseLine,
  RiTimeLine,
  RiDownloadLine,
} from '@remixicon/react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: RiDashboardLine },
  { label: 'Organization', href: '/organization', icon: RiBuilding2Line },
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
  { label: 'EwayBill', href: '/ewaybill', icon: RiReceiptLine },
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
  {
    label: 'Analytics',
    icon: RiLineChartLine,
    children: [{ label: 'Reports', href: '/analytics/reports' }],
  },
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
];

function NavSection({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = item.href
    ? pathname === item.href
    : item.children?.some((c) => pathname.startsWith(c.href));

  const [open, setOpen] = useState(isActive ?? false);

  if (!item.children) {
    return (
      <Link
        href={item.href!}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          pathname === item.href
            ? 'bg-white/10 text-white'
            : 'text-white/60 hover:bg-white/8 hover:text-white',
        )}
      >
        <item.icon size={16} className="shrink-0" />
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          isActive ? 'text-white' : 'text-white/60 hover:bg-white/8 hover:text-white',
        )}
      >
        <item.icon size={16} className="shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <RiArrowDownSLine
          size={14}
          className={cn('shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="ml-7 mt-0.5 flex flex-col gap-0.5 border-l border-white/10 pl-3">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                'rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-150',
                pathname === child.href
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/8 hover:text-white',
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
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
        'fixed left-0 top-0 z-40 flex h-screen flex-col bg-[#0f172a] transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary-base">
              <RiTruckLine size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">LogiCore</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex size-7 items-center justify-center rounded-lg bg-primary-base">
            <RiTruckLine size={14} className="text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="rounded-md p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
          >
            <RiCloseLine size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href ?? item.children?.[0]?.href ?? '/'}
                className={cn(
                  'flex size-9 items-center justify-center rounded-lg transition-all',
                  'text-white/50 hover:bg-white/10 hover:text-white',
                )}
                title={item.label}
              >
                <item.icon size={18} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <NavSection key={item.label} item={item} pathname={pathname} />
            ))}
          </div>
        )}
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="border-t border-white/10 p-2">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-white"
          >
            <RiMenuLine size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
