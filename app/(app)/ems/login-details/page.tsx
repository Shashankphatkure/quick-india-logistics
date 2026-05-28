import React from 'react';
import Link from 'next/link';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiHistoryLine } from '@remixicon/react';
import { cn } from '@/utils/cn';
import { listLoginEvents, countLoginEvents, getLoginEventCounts, LOGIN_PAGE_SIZE } from '@/lib/db/login-events';
import { currentOrgId } from '@/lib/tenant';
import PaginationLinks from '@/components/pagination-links';

const EMS_TABS = [
  { label: 'Login Details', href: '/ems/login-details' },
  { label: 'Permission', href: '/ems/permissions' },
  { label: 'Users', href: '/ems/users' },
  { label: 'Departments', href: '/ems/departments' },
  { label: 'Designations', href: '/ems/designations' },
  { label: 'Change Password', href: '/ems/change-password' },
];

const EVENT_LABEL: Record<string, { label: string; color: 'green' | 'red' | 'gray' | 'orange' }> = {
  login_success: { label: 'Login', color: 'green' },
  login_failure: { label: 'Failed', color: 'red' },
  logout: { label: 'Logout', color: 'gray' },
  forced_logout: { label: 'Forced Logout', color: 'orange' },
};

export default async function LoginDetailsPage({ searchParams }: { searchParams?: { event?: string; page?: string } }) {
  const orgId = await currentOrgId();
  const eventType = searchParams?.event;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [rows, total, counts] = await Promise.all([
    listLoginEvents({ orgId, eventType, page }),
    countLoginEvents({ orgId, eventType }),
    getLoginEventCounts(orgId),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / LOGIN_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiHistoryLine}
        iconColor="bg-primary-alpha-10 text-primary-base"
        title="Login Details"
        subtitle="Audit log of user login activity"
        breadcrumbs={[{ label: 'EMS', href: '/ems/login-details' }, { label: 'Login Details' }]}
      />

      <StatsStrip stats={[
        { label: 'Total Events', value: counts.total, trend: 0, trendLabel: 'all time' },
        { label: 'Logins', value: counts.success, trend: 0, trendLabel: 'all time' },
        { label: 'Failed', value: counts.failure, trend: 0, trendLabel: 'all time' },
        { label: 'Logouts', value: counts.logout, trend: 0, trendLabel: 'all time' },
      ]} />

      <div className="flex gap-0.5 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {EMS_TABS.map(t => (
          <Link key={t.href} href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-sm font-medium no-underline transition',
              t.href === '/ems/login-details'
                ? 'bg-primary-base text-static-white shadow-regular-xs'
                : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
            )}
          >{t.label}</Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            <a href="/ems/login-details" className={cn('rounded-md px-2 py-1 text-paragraph-sm no-underline transition', !eventType ? 'bg-primary-base text-static-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>All</a>
            <a href="/ems/login-details?event=login_success" className={cn('rounded-md px-2 py-1 text-paragraph-sm no-underline transition', eventType === 'login_success' ? 'bg-primary-base text-static-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>Logins</a>
            <a href="/ems/login-details?event=login_failure" className={cn('rounded-md px-2 py-1 text-paragraph-sm no-underline transition', eventType === 'login_failure' ? 'bg-primary-base text-static-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>Failures</a>
            <a href="/ems/login-details?event=logout" className={cn('rounded-md px-2 py-1 text-paragraph-sm no-underline transition', eventType === 'logout' ? 'bg-primary-base text-static-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>Logouts</a>
          </div>
          <span className="text-paragraph-sm text-text-sub-600">{total} events</span>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>{['When', 'User', 'Event', 'IP Address', 'User Agent'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={5} className="py-10 text-center text-paragraph-sm text-text-sub-600">No events</Table.Cell></Table.Row>
            ) : rows.map(e => {
              const el = EVENT_LABEL[e.event_type] ?? { label: e.event_type, color: 'gray' as const };
              return (
                <Table.Row key={e.id}>
                  <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{e.occurred_at}</Table.Cell>
                  <Table.Cell className="h-auto py-3">
                    <div>
                      <p className="text-paragraph-sm font-medium text-text-strong-950">{e.user_name}</p>
                      <p className="text-paragraph-xs text-text-sub-600">{e.username}</p>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="h-auto py-3"><Badge.Root size="small" variant="lighter" color={el.color}>{el.label}</Badge.Root></Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600 font-mono">{e.ip_address ?? '—'}</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600 truncate max-w-[280px]">{e.user_agent ?? '—'}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {total === 0 ? 0 : (page-1)*LOGIN_PAGE_SIZE+1}-{Math.min(page*LOGIN_PAGE_SIZE, total)} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/ems/login-details" query={{ event: eventType }} />
        </div>
      </div>
    </div>
  );
}
