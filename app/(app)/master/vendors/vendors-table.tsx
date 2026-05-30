'use client';

import React, { useState } from 'react';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import { Root as Checkbox } from '@/components/ui/checkbox';
import { RiCheckLine, RiToggleLine } from '@remixicon/react';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';
import type { VendorRow } from '@/lib/db/vendors';
import RowActions from './row-actions';
import BulkActionBar from '@/components/bulk-action-bar';
import { bulkApproveVendorsAction, bulkDeactivateVendorsAction } from './actions';

const STATUS_LABEL: Record<string, string> = { approved: 'Approved', pending: 'Pending', rejected: 'Rejected' };
const REGION_LABEL: Record<string, string> = { pan_india: 'Pan India', state: 'State', city: 'City' };

export default function VendorsTable({ rows }: { rows: VendorRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const toggleAll = () => setSelected(allSelected ? [] : rows.map((r) => r.id));
  const toggleOne = (id: string) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <>
      <BulkActionBar
        selected={selected}
        onClear={() => setSelected([])}
        actions={[
          { label: 'Approve', icon: RiCheckLine, action: bulkApproveVendorsAction, successMsg: 'Approved {n} vendors' },
          { label: 'Deactivate', icon: RiToggleLine, action: bulkDeactivateVendorsAction, successMsg: 'Deactivated {n} vendors', confirmMsg: 'Deactivate {n} vendors?' },
        ]}
      />
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head className="w-10"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></Table.Head>
            <Table.Head>Vendor Name</Table.Head>
            <Table.Head className="hidden lg:table-cell">PAN</Table.Head>
            <Table.Head className="hidden lg:table-cell">Email</Table.Head>
            <Table.Head className="hidden md:table-cell">Phone</Table.Head>
            <Table.Head className="hidden lg:table-cell">Company Type</Table.Head>
            <Table.Head className="hidden md:table-cell">Service Region</Table.Head>
            <Table.Head className="hidden lg:table-cell">Line of Business</Table.Head>
            <Table.Head className="hidden lg:table-cell">Verified By</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head className="text-right">Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.length === 0 ? (
            <Table.Row><Table.Cell colSpan={11} className="py-10 text-center text-paragraph-sm text-text-sub-600">No vendors found</Table.Cell></Table.Row>
          ) : rows.map(v => (
            <Table.Row key={v.id} className={v.is_active ? '' : 'opacity-60'}>
              <Table.Cell className="h-auto py-3 w-10" onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={selected.includes(v.id)} onCheckedChange={() => toggleOne(v.id)} />
              </Table.Cell>
              <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-primary-base">{v.name}{!v.is_active && <span className="ml-1.5 text-paragraph-xs text-text-soft-400">(inactive)</span>}</span></Table.Cell>
              <Table.Cell className="hidden lg:table-cell h-auto py-3 text-paragraph-sm text-text-sub-600">{v.pan ?? '—'}</Table.Cell>
              <Table.Cell className="hidden lg:table-cell h-auto py-3 text-paragraph-xs text-text-sub-600">{v.primary_email ?? '—'}</Table.Cell>
              <Table.Cell className="hidden md:table-cell h-auto py-3 text-paragraph-sm text-text-sub-600">{v.primary_phone ?? '—'}</Table.Cell>
              <Table.Cell className="hidden lg:table-cell h-auto py-3 text-paragraph-sm text-text-sub-600">{v.company_type ?? '—'}</Table.Cell>
              <Table.Cell className="hidden md:table-cell h-auto py-3 text-paragraph-sm text-text-sub-600">{REGION_LABEL[v.service_region ?? ''] ?? '—'}</Table.Cell>
              <Table.Cell className="hidden lg:table-cell h-auto py-3 text-paragraph-sm text-text-sub-600">{v.line_of_business ?? '—'}</Table.Cell>
              <Table.Cell className="hidden lg:table-cell h-auto py-3 text-paragraph-sm text-text-sub-600">{v.verified_by_name ?? '—'}</Table.Cell>
              <Table.Cell className="h-auto py-3">
                <Badge.Root size="medium" variant="light" color={(STATUS_TO_BADGE_COLOR[STATUS_LABEL[v.status] ?? v.status] ?? 'gray') as BadgeColor}>
                  <Badge.Dot />{STATUS_LABEL[v.status] ?? v.status}
                </Badge.Root>
              </Table.Cell>
              <Table.Cell className="h-auto py-3 text-right"><RowActions row={v} /></Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
}
