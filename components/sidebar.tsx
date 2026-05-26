'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useMediaQuery } from '@/hooks/use-media-query';
import * as Tooltip from '@/components/ui/tooltip';
import * as Avatar from '@/components/ui/avatar';
import * as Dropdown from '@/components/ui/dropdown';
import * as CompactButton from '@/components/ui/compact-button';
import {
  RiDashboardLine,
  RiBuilding2Line,
  RiTeamLine,
  RiReceiptLine,
  RiDatabase2Line,
  RiCalendarCheckLine,
  RiListCheck2,
  RiFilePaperLine,
  RiLineChartLine,
  RiMore2Line,
  RiSearchEyeLine,
  RiCustomerServiceLine,
  RiArrowDownSLine,
  RiSidebarFoldLine,
  RiSidebarUnfoldLine,
  RiTruckLine,
  RiUserLine,
  RiSettings3Line,
  RiLogoutBoxLine,
  RiCloseLine,
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

const ALL_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

function isHrefActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}

/* ── Expanded: single leaf or expandable parent ── */
function NavSection({ item, pathname }: { item: NavItem; pathname: string }) {
  const isLeafActive = item.href ? isHrefActive(pathname, item.href) : false;
  const isParentActive = item.children?.some((c) => isHrefActive(pathname, c.href));

  const [open, setOpen] = useState<boolean>(isLeafActive || !!isParentActive);

  if (!item.children) {
    return (
      <Link
        href={item.href!}
        className={cn(
          'group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-label-sm no-underline transition duration-200 ease-out',
          isLeafActive
            ? 'bg-bg-weak-50 text-text-strong-950'
            : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
        )}
      >
        {isLeafActive && (
          <span className='absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary-base' />
        )}
        <item.icon
          size={20}
          className={cn(
            'shrink-0 transition-colors',
            isLeafActive
              ? 'text-primary-base'
              : 'text-text-sub-600 group-hover:text-text-strong-950',
          )}
        />
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type='button'
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-label-sm transition duration-200 ease-out',
          isParentActive
            ? 'text-text-strong-950'
            : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
        )}
      >
        <item.icon
          size={20}
          className={cn(
            'shrink-0 transition-colors',
            isParentActive
              ? 'text-primary-base'
              : 'text-text-sub-600 group-hover:text-text-strong-950',
          )}
        />
        <span className='flex-1 text-left'>{item.label}</span>
        <RiArrowDownSLine
          size={18}
          className={cn(
            'shrink-0 text-text-soft-400 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-200 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className='overflow-hidden'>
          <div className='ml-[26px] mt-0.5 flex flex-col gap-0.5 border-l border-stroke-soft-200 pb-1 pl-3'>
            {item.children.map((child) => {
              const childActive = isHrefActive(pathname, child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'relative rounded-md px-2.5 py-1.5 text-paragraph-sm no-underline transition duration-150 ease-out',
                    childActive
                      ? 'font-medium text-primary-base'
                      : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
                  )}
                >
                  {childActive && (
                    <span className='absolute -left-[13px] top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary-base' />
                  )}
                  {child.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Collapsed: icon-only with tooltip ── */
function CollapsedItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const href = item.href ?? item.children?.[0]?.href ?? '/';
  const isActive = item.href
    ? isHrefActive(pathname, item.href)
    : !!item.children?.some((c) => isHrefActive(pathname, c.href));

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Link
          href={href}
          className={cn(
            'flex size-10 items-center justify-center rounded-lg no-underline transition duration-200 ease-out',
            isActive
              ? 'bg-primary-alpha-10 text-primary-base'
              : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
          )}
        >
          <item.icon size={20} />
        </Link>
      </Tooltip.Trigger>
      <Tooltip.Content side='right' sideOffset={8}>
        {item.label}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // The icon-rail is a desktop-only affordance; on mobile the drawer is
  // always shown in its full, expanded form.
  const showRail = isDesktop && collapsed;

  return (
    <Tooltip.Provider delayDuration={200}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-stroke-soft-200 bg-bg-white-0 transition-[transform,width] duration-300 ease-out',
          showRail ? 'w-16' : 'w-72 lg:w-60',
          // Mobile: slide off-canvas unless opened. Desktop: always visible.
          mobileOpen ? 'translate-x-0 shadow-regular-md' : '-translate-x-full',
          'lg:translate-x-0 lg:shadow-none',
        )}
      >
        {/* ── Logo ── */}
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b border-stroke-soft-200',
            showRail ? 'justify-center px-2' : 'justify-between px-4',
          )}
        >
          {showRail ? (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type='button'
                  onClick={onToggle}
                  className='flex size-9 items-center justify-center rounded-lg bg-primary-base text-static-white shadow-regular-sm transition hover:bg-primary-darker'
                >
                  <RiTruckLine size={18} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content side='right' sideOffset={8}>
                Expand sidebar
              </Tooltip.Content>
            </Tooltip.Root>
          ) : (
            <>
              <div className='flex items-center gap-2.5'>
                <div className='flex size-9 items-center justify-center rounded-lg bg-primary-base text-static-white shadow-regular-sm'>
                  <RiTruckLine size={18} />
                </div>
                <div className='leading-none'>
                  <p className='text-label-sm text-text-strong-950'>LogiCore</p>
                  <p className='mt-1 text-subheading-2xs uppercase text-text-soft-400'>
                    Logistics Suite
                  </p>
                </div>
              </div>
              {/* Mobile: close drawer */}
              <CompactButton.Root
                variant='ghost'
                size='large'
                onClick={onMobileClose}
                className='lg:hidden'
                aria-label='Close menu'
              >
                <CompactButton.Icon as={RiCloseLine} />
              </CompactButton.Root>
              {/* Desktop: collapse to icon rail */}
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <CompactButton.Root
                    variant='ghost'
                    size='large'
                    onClick={onToggle}
                    className='hidden lg:flex'
                  >
                    <CompactButton.Icon as={RiSidebarFoldLine} />
                  </CompactButton.Root>
                </Tooltip.Trigger>
                <Tooltip.Content side='bottom' sideOffset={8}>
                  Collapse sidebar
                </Tooltip.Content>
              </Tooltip.Root>
            </>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className='flex-1 overflow-y-auto overflow-x-hidden py-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stroke-soft-200'>
          {showRail ? (
            <div className='flex flex-col items-center gap-1 px-2'>
              {ALL_ITEMS.map((item) => (
                <CollapsedItem key={item.label} item={item} pathname={pathname} />
              ))}
            </div>
          ) : (
            <div className='flex flex-col gap-6 px-3'>
              {NAV_GROUPS.map((group, gi) => (
                <div key={gi} className='flex flex-col gap-1'>
                  {group.title && (
                    <p className='mb-1 px-3 text-subheading-2xs uppercase tracking-wider text-text-soft-400'>
                      {group.title}
                    </p>
                  )}
                  {group.items.map((item) => (
                    <NavSection key={item.label} item={item} pathname={pathname} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* ── User footer ── */}
        <div className={cn('shrink-0 border-t border-stroke-soft-200', showRail ? 'p-2' : 'p-3')}>
          <Dropdown.Root>
            <Dropdown.Trigger asChild>
              {showRail ? (
                <button
                  type='button'
                  className='flex w-full items-center justify-center rounded-lg p-1 transition hover:bg-bg-weak-50'
                >
                  <Avatar.Root size='32' color='blue'>
                    GN
                  </Avatar.Root>
                </button>
              ) : (
                <button
                  type='button'
                  className='flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition hover:bg-bg-weak-50'
                >
                  <Avatar.Root size='40' color='blue'>
                    GN
                    <Avatar.Indicator position='bottom'>
                      <Avatar.Status status='online' />
                    </Avatar.Indicator>
                  </Avatar.Root>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-label-sm text-text-strong-950'>Ganesh</p>
                    <p className='truncate text-paragraph-xs text-text-sub-600'>Admin Manager</p>
                  </div>
                  <RiArrowDownSLine size={18} className='shrink-0 text-text-soft-400' />
                </button>
              )}
            </Dropdown.Trigger>
            <Dropdown.Content side='top' align={showRail ? 'center' : 'start'} className='w-56'>
              <Dropdown.Item asChild>
                <Link href='/ems/users'>
                  <Dropdown.ItemIcon as={RiUserLine} />
                  Profile
                </Link>
              </Dropdown.Item>
              <Dropdown.Item asChild>
                <Link href='/ems/change-password'>
                  <Dropdown.ItemIcon as={RiSettings3Line} />
                  Settings
                </Link>
              </Dropdown.Item>
              <Dropdown.Separator />
              <Dropdown.Item asChild className='text-error-base'>
                <Link href='/login'>
                  <Dropdown.ItemIcon as={RiLogoutBoxLine} className='text-error-base' />
                  Sign out
                </Link>
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Root>
        </div>

        {/* Collapsed expand affordance */}
        {showRail && (
          <div className='shrink-0 border-t border-stroke-soft-200 p-2'>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <CompactButton.Root
                  variant='ghost'
                  size='large'
                  onClick={onToggle}
                  className='w-full'
                >
                  <CompactButton.Icon as={RiSidebarUnfoldLine} />
                </CompactButton.Root>
              </Tooltip.Trigger>
              <Tooltip.Content side='right' sideOffset={8}>
                Expand sidebar
              </Tooltip.Content>
            </Tooltip.Root>
          </div>
        )}
      </aside>
    </Tooltip.Provider>
  );
}
