'use client';

import React, { useState } from 'react';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import { Root as Checkbox } from '@/components/ui/checkbox';
import { RiCheckLine, RiToggleLine } from '@remixicon/react';
import type { VehicleRow } from '@/lib/db/vehicles';
import RowActions from './row-actions';
import BulkActionBar from '@/components/bulk-action-bar';
import { bulkActivateVehiclesAction, bulkDeactivateVehiclesAction } from './actions';

const TYPE_LABEL: Record<string, string> = {
  truck: 'Truck', van: 'Van', bike: 'Bike', tempo: 'Tempo', mini_truck: 'Mini Truck',
};
const OWNER_LABEL: Record<string, string> = {
  owned: 'Owned', partner: 'Partner', market: 'Market',
};

export default function VehiclesTable({ rows }: { rows: VehicleRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const toggleAll = () => setSelected(allSelected ? [] : rows.map((r) => r.id));
  const toggleOne = (id: string) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <>
      <div className="px-1 pt-1">
        <BulkActionBar
          selected={selected}
          onClear={() => setSelected([])}
          actions={[
            { label: 'Activate', icon: RiCheckLine, action: bulkActivateVehiclesAction, successMsg: 'Activated {n} vehicles' },
            { label: 'Deactivate', icon: RiToggleLine, action: bulkDeactivateVehiclesAction, successMsg: 'Deactivated {n} vehicles', confirmMsg: 'Deactivate {n} vehicles?' },
          ]}
        />
      </div>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head className="w-10"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></Table.Head>
            <Table.Head>Vehicle No</Table.Head>
            <Table.Head className="hidden md:table-cell">Type</Table.Head>
            <Table.Head className="hidden md:table-cell">Owner</Table.Head>
            <Table.Head className="hidden lg:table-cell">Model</Table.Head>
            <Table.Head className="hidden md:table-cell">Capacity (kg)</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head className="text-right">Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.length === 0 ? (
            <Table.Row><Table.Cell colSpan={8} className="py-10 text-center text-paragraph-sm text-text-sub-600">No vehicles found</Table.Cell></Table.Row>
          ) : rows.map(v => (
            <Table.Row key={v.id} className={v.is_active ? '' : 'opacity-60'}>
              <Table.Cell className="h-auto py-3 w-10" onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={selected.includes(v.id)} onCheckedChange={() => toggleOne(v.id)} />
              </Table.Cell>
              <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-primary-base">{v.number}</span></Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600 hidden md:table-cell">{TYPE_LABEL[v.vehicle_type ?? ''] ?? '—'}</Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600 hidden md:table-cell">{OWNER_LABEL[v.owner_type ?? ''] ?? '—'}</Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600 hidden lg:table-cell">{v.model ?? '—'}</Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600 hidden md:table-cell">{v.capacity_kg ?? '—'}</Table.Cell>
              <Table.Cell className="h-auto py-3">
                <Badge.Root size="medium" variant="light" color={v.is_active ? 'green' : 'gray'}>
                  <Badge.Dot />{v.is_active ? 'Active' : 'Inactive'}
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
