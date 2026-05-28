import React from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PaginationLinks from '@/components/pagination-links';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiSearchLine, RiStore2Line } from '@remixicon/react';
import FilterPopover from '@/components/filter-popover';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';
import { listBranches, countBranches, getBranchCounts } from '@/lib/db/branches';
import { currentOrgId } from '@/lib/tenant';
import AddBranchForm from './add-branch-form';

const PAGE_SIZE = 10;

const BRANCH_TYPE_LABEL: Record<string, string> = {
  hub: 'Hub',
  branch: 'Branch',
  franchise: 'Franchise',
  vendor: 'Vendor',
};

export default async function BranchesPage({
  searchParams,
}: {
  searchParams?: { search?: string; page?: string };
}) {
  const orgId = await currentOrgId();
  const search = searchParams?.search?.trim() || undefined;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [rows, total, counts] = await Promise.all([
    listBranches({ orgId, search, page, pageSize: PAGE_SIZE }),
    countBranches({ orgId, search }),
    getBranchCounts(orgId),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const fromRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toRow = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiStore2Line}
        iconColor="bg-away-lighter text-away-base"
        title="Branches"
        subtitle="Manage branch locations and teams"
        breadcrumbs={[{ label: 'Master', href: '/master/branches' }, { label: 'Branches' }]}
      >
        <FilterPopover fields={[
          { name: 'search', label: 'Branch Code / Name', type: 'text', placeholder: 'QIL-...' },
        ]} />
        <AddBranchForm />
      </PageHeader>

      <StatsStrip
        stats={[
          { label: 'Total Branches', value: counts.total, trend: 0, trendLabel: 'all time' },
          { label: 'Active', value: counts.active, trend: 0, trendLabel: 'all time' },
          { label: 'Hubs', value: counts.hubs, trend: 0, trendLabel: 'all time' },
          { label: 'Vendors', value: counts.vendors, trend: 0, trendLabel: 'all time' },
        ]}
      />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <form method="GET">
            <Input.Root size="small" className="w-full max-w-xs">
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.Input name="search" defaultValue={search ?? ''} placeholder="Search branches..." />
              </Input.Wrapper>
            </Input.Root>
          </form>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['Branch Code', 'Branch Name', 'Type', 'Location', 'Email', 'Phone', 'Head', 'Verified By', 'Status'].map(
                (col) => (
                  <Table.Head key={col}>{col}</Table.Head>
                ),
              )}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={9} className="py-10 text-center text-paragraph-sm text-text-sub-600">
                  No branches found
                </Table.Cell>
              </Table.Row>
            ) : (
              rows.map((b) => {
                const location = [b.city, b.state, b.pincode].filter(Boolean).join(', ');
                const statusLabel = b.is_active ? 'Active' : 'Inactive';
                return (
                  <Table.Row key={b.id}>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{b.code}</Table.Cell>
                    <Table.Cell className="h-auto py-3">
                      <span className="text-paragraph-sm font-medium text-primary-base">{b.name}</span>
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">
                      {BRANCH_TYPE_LABEL[b.branch_type] ?? b.branch_type}
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{location || '—'}</Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{b.email ?? '—'}</Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{b.phone ?? '—'}</Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{b.head_name ?? '—'}</Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">
                      {b.verified_by_name ?? '—'}
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3">
                      <Badge.Root
                        size="medium"
                        variant="light"
                        color={(STATUS_TO_BADGE_COLOR[statusLabel] ?? 'gray') as BadgeColor}
                      >
                        <Badge.Dot />
                        {statusLabel}
                      </Badge.Root>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">
            Showing {fromRow}-{toRow} of {total}
          </span>
          <PaginationLinks
            page={page}
            totalPages={totalPages}
            basePath="/master/branches"
            query={{ search }}
          />
        </div>
      </div>
    </div>
  );
}
