'use client';
import React from 'react';
import Link from 'next/link';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Pagination from '@/components/ui/pagination';
import PageHeader from '@/components/page-header';
import {
  RiSearchLine, RiLoginBoxLine,
  RiArrowLeftSLine, RiArrowRightSLine, RiArrowUpDownLine,
} from '@remixicon/react';
import { cn } from '@/utils/cn';

const EMS_TABS = [
  { label: 'Login Details', href: '/ems/login-details' },
  { label: 'Permission', href: '/ems/permissions' },
  { label: 'Users', href: '/ems/users' },
  { label: 'Departments', href: '/ems/departments' },
  { label: 'Designations', href: '/ems/designations' },
  { label: 'Change Password', href: '/ems/change-password' },
];

const LOGINS = [
  { user: 'vandana', ip: '103.117.185.125', latlong: '-', platform: '-', isMobile: 'No', loginTime: '2026-05-12 14:30:25', logoutTime: '-' },
  { user: 'manikanta', ip: '49.37.234.213', latlong: '-', platform: '-', isMobile: 'No', loginTime: '2026-05-12 14:30:16', logoutTime: '-' },
  { user: 'anantrij', ip: '182.48.286.174', latlong: '-', platform: '-', isMobile: 'No', loginTime: '2026-05-12 14:30:01', logoutTime: '-' },
  { user: 'account', ip: '122.170.98.91', latlong: '-', platform: '-', isMobile: 'No', loginTime: '2026-05-12 14:29:38', logoutTime: '-' },
];

export default function LoginDetailsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={RiLoginBoxLine}
        iconColor="bg-faded-light text-faded-dark"
        title="Login Details"
        subtitle="Audit trail of all user login sessions"
        breadcrumbs={[{ label: 'EMS', href: '/ems/users' }, { label: 'Login Details' }]}
      />

      {/* EMS sub-tabs */}
      <div className="flex gap-0.5 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {EMS_TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium no-underline transition',
              t.href === '/ems/login-details'
                ? 'bg-primary-base text-static-white shadow-regular-xs'
                : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <Input.Root size="small" className="w-full max-w-xs">
            <Input.Wrapper>
              <Input.Icon as={RiSearchLine} />
              <Input.Input placeholder="Search users..." />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['User', 'IP Address', 'Longitude / Latitude', 'Platform', 'Is Mobile', 'Login Time', 'Logout Time'].map(col => (
                <Table.Head key={col}>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    {col}<RiArrowUpDownLine size={11} className="text-text-disabled-300" />
                  </span>
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {LOGINS.map(l => (
              <Table.Row key={l.user + l.loginTime}>
                <Table.Cell className="h-auto py-3">
                  <span className="text-paragraph-sm font-medium text-text-strong-950">{l.user}</span>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{l.ip}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{l.latlong}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{l.platform}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{l.isMobile}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs whitespace-nowrap text-text-sub-600">{l.loginTime}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{l.logoutTime}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing 1-10 of 7,005</span>
          <Pagination.Root variant="rounded">
            <Pagination.NavButton><Pagination.NavIcon as={RiArrowLeftSLine} /></Pagination.NavButton>
            <Pagination.Item current>1</Pagination.Item>
            <Pagination.Item>2</Pagination.Item>
            <Pagination.NavButton><Pagination.NavIcon as={RiArrowRightSLine} /></Pagination.NavButton>
          </Pagination.Root>
        </div>
      </div>
    </div>
  );
}
