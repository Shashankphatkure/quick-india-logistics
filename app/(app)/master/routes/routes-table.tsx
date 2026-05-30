'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as CompactButton from '@/components/ui/compact-button';
import * as Tooltip from '@/components/ui/tooltip';
import { RiArrowRightLine, RiDeleteBinLine } from '@remixicon/react';
import { removeRouteAction } from './actions';

export type RouteRow = {
  id: string;
  client_name: string;
  mode: string;
  origin_name: string;
  destination_name: string;
  tat_hours: number;
  rate_per_kg: string | null;
};

const MODE_LABEL: Record<string, string> = {
  local: 'Local', air: 'Air', surface: 'Surface', cargo: 'Cargo',
  train: 'Train', courier: 'Courier', warehouse: 'Warehouse',
};

export default function RoutesTable({ rows }: { rows: RouteRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove(r: RouteRow) {
    if (!confirm(`Remove route ${r.client_name}: ${r.origin_name} → ${r.destination_name} (${MODE_LABEL[r.mode] ?? r.mode})?`)) return;
    startTransition(async () => {
      const res = await removeRouteAction(r.id);
      if (res.ok) { toast.success('Route removed'); router.refresh(); }
      else toast.error(res.error);
    });
  }

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>{['Client', 'Mode', 'Origin → Destination', 'TAT', 'Rate (₹/kg)', ''].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.length === 0 ? (
          <Table.Row><Table.Cell colSpan={6} className="py-10 text-center text-paragraph-sm text-text-sub-600">No routes configured</Table.Cell></Table.Row>
        ) : rows.map(r => (
          <Table.Row key={r.id}>
            <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-text-strong-950">{r.client_name}</span></Table.Cell>
            <Table.Cell className="h-auto py-3">
              <Badge.Root size="small" variant="lighter" color="blue">{MODE_LABEL[r.mode] ?? r.mode}</Badge.Root>
            </Table.Cell>
            <Table.Cell className="h-auto py-3">
              <span className="inline-flex items-center gap-1.5 text-paragraph-sm text-text-sub-600">
                {r.origin_name}
                <RiArrowRightLine size={12} className="text-text-disabled-300" />
                {r.destination_name}
              </span>
            </Table.Cell>
            <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{r.tat_hours} hrs</Table.Cell>
            <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{r.rate_per_kg ? `₹${r.rate_per_kg}` : '—'}</Table.Cell>
            <Table.Cell className="h-auto py-3 text-right">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <CompactButton.Root variant="ghost" size="large" onClick={() => remove(r)} disabled={pending}>
                    <CompactButton.Icon as={RiDeleteBinLine} />
                  </CompactButton.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>Remove route</Tooltip.Content>
              </Tooltip.Root>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
