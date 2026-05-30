'use client';

import React, { useState } from 'react';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import { Root as Checkbox } from '@/components/ui/checkbox';
import { RiToggleLine, RiArrowUpDownLine } from '@remixicon/react';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';
import { bulkActivateCommoditiesAction, bulkDeactivateCommoditiesAction } from './actions';
import RowActions from './row-actions';
import BulkActionBar from '@/components/bulk-action-bar';

type Row = {
  id: string;
  name: string;
  type_id: string;
  type_name: string;
  org_name: string;
  verified_by_name: string | null;
  is_active: boolean;
  expiry_days: number | null;
};

type CommodityType = { id: string; name: string; perishable: boolean };

export default function CommoditiesTable({ rows, types }: { rows: Row[]; types: CommodityType[] }) {
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
          {
            label: 'Deactivate',
            icon: RiToggleLine,
            action: bulkDeactivateCommoditiesAction,
            successMsg: 'Deactivated {n} commodities',
            confirmMsg: 'Deactivate {n} commodities?',
          },
          {
            label: 'Activate',
            icon: RiToggleLine,
            action: bulkActivateCommoditiesAction,
            successMsg: 'Activated {n} commodities',
          },
        ]}
      />
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head className="w-10"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></Table.Head>
            {['Commodity Name', 'Type', 'Expiry', 'Organization', 'Verified By', 'Status', ''].map((col) => (
              <Table.Head key={col}>
                {col && (
                  <span className="flex items-center gap-1">
                    {col}
                    <RiArrowUpDownLine size={11} className="text-text-disabled-300" />
                  </span>
                )}
              </Table.Head>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={8} className="py-10 text-center text-paragraph-sm text-text-sub-600">No commodities found</Table.Cell>
            </Table.Row>
          ) : rows.map((c) => {
            const statusLabel = c.is_active ? 'Active' : 'Inactive';
            return (
              <Table.Row key={c.id}>
                <Table.Cell className="h-auto py-3 w-10" onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selected.includes(c.id)} onCheckedChange={() => toggleOne(c.id)} />
                </Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <span className="text-paragraph-sm font-semibold text-text-strong-950 cursor-pointer hover:text-primary-base transition-colors">{c.name}</span>
                </Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="small" variant="lighter" color="gray">{c.type_name}</Badge.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-3">
                  {c.expiry_days != null
                    ? <Badge.Root size="small" variant="lighter" color="orange">{c.expiry_days} days</Badge.Root>
                    : <span className="text-paragraph-sm text-text-soft-400">—</span>}
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{c.org_name}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{c.verified_by_name ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="medium" variant="light" color={(STATUS_TO_BADGE_COLOR[statusLabel] ?? 'gray') as BadgeColor}>
                    <Badge.Dot />{statusLabel}
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-right">
                  <RowActions row={{ id: c.id, name: c.name, type_id: c.type_id, is_active: c.is_active, expiry_days: c.expiry_days }} types={types} />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </>
  );
}
