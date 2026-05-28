import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiTeamLine } from '@remixicon/react';
import FilterPopover from '@/components/filter-popover';
import { cn } from '@/utils/cn';
import {
  listUsers,
  countUsers,
  getUserCounts,
  listDepartmentsForSelect,
  listDesignationsForSelect,
} from '@/lib/db/users';
import { listBranchesForSelect } from '@/lib/db/branches';
import { currentOrgId } from '@/lib/tenant';
import PaginationLinks from '@/components/pagination-links';
import UsersTable from './users-table';

const EMS_TABS = [
  { label: 'Login Details', href: '/ems/login-details' },
  { label: 'Permission', href: '/ems/permissions' },
  { label: 'Users', href: '/ems/users' },
  { label: 'Departments', href: '/ems/departments' },
  { label: 'Designations', href: '/ems/designations' },
  { label: 'Change Password', href: '/ems/change-password' },
];

const PAGE_SIZE = 25;

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: { search?: string; page?: string };
}) {
  const orgId = await currentOrgId();
  const search = searchParams?.search?.trim() || undefined;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [users, total, counts, departments, designations, branches] = await Promise.all([
    listUsers({ orgId, search, page, pageSize: PAGE_SIZE }),
    countUsers({ orgId, search }),
    getUserCounts(orgId),
    listDepartmentsForSelect(orgId),
    listDesignationsForSelect(orgId),
    listBranchesForSelect(orgId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiTeamLine}
        iconColor="bg-primary-alpha-10 text-primary-base"
        title="Users"
        subtitle="Manage employees, roles and access"
        breadcrumbs={[{ label: 'EMS', href: '/ems/users' }, { label: 'Users' }]}
      >
        <FilterPopover fields={[
          { name: 'search', label: 'Name / Username / Email', type: 'text', placeholder: 'Search...' },
        ]} />
      </PageHeader>

      <StatsStrip
        stats={[
          { label: 'Total Users', value: counts.total, trend: 0, trendLabel: 'all time' },
          { label: 'Active', value: counts.active, trend: 0, trendLabel: 'all time' },
          { label: 'Admins', value: counts.admins, trend: 0, trendLabel: 'all time' },
          { label: 'Departments', value: departments.length, trend: 0, trendLabel: 'all time' },
        ]}
      />

      <div className="flex gap-0.5 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {EMS_TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-sm font-medium no-underline transition',
              t.href === '/ems/users'
                ? 'bg-primary-base text-static-white shadow-regular-xs'
                : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <UsersTable
        users={users}
        totalCount={total}
        selects={{ departments, designations, branches }}
      />

      <div className="flex items-center justify-between">
        <span className="text-paragraph-sm text-text-sub-600">
          Page {page} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}
        </span>
        <PaginationLinks
          page={page}
          totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
          basePath="/ems/users"
          query={{ search }}
        />
      </div>
    </div>
  );
}
