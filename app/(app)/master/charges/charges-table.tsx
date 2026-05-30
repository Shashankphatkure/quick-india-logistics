'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as CompactButton from '@/components/ui/compact-button';
import * as Tooltip from '@/components/ui/tooltip';
import { RiDeleteBinLine } from '@remixicon/react';
import type { ChargeRow } from '@/lib/db/charges';
import { removeChargeAction } from './actions';

const TYPE_LABEL: Record<string, string> = { percent: '%', flat: '₹ flat', per_kg: '₹/kg', per_box: '₹/box' };
const TYPE_COLOR: Record<string, 'blue' | 'green' | 'purple'> = { percent: 'blue', flat: 'green', per_kg: 'purple', per_box: 'purple' };

function formatValue(c: ChargeRow): string {
  const v = c.default_value;
  if (c.charge_type === 'percent') return `${v}%`;
  if (c.charge_type === 'per_kg') return `₹${v}/kg`;
  if (c.charge_type === 'per_box') return `₹${v}/box`;
  return `₹${v}`;
}

export default function ChargesTable({ rows }: { rows: ChargeRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove(c: ChargeRow) {
    if (!confirm(`Remove charge "${c.label}" (${c.code})?`)) return;
    startTransition(async () => {
      const r = await removeChargeAction(c.id);
      if (r.ok) { toast.success('Charge removed'); router.refresh(); }
      else toast.error(r.error);
    });
  }

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>{['Code', 'Charge', 'Description', 'Type', 'Default Value', 'Applies To', ''].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.length === 0 ? (
          <Table.Row><Table.Cell colSpan={7} className="py-10 text-center text-paragraph-sm text-text-sub-600">No charges configured</Table.Cell></Table.Row>
        ) : rows.map(c => (
          <Table.Row key={c.id}>
            <Table.Cell className="h-auto py-3"><span className="text-paragraph-xs font-mono text-text-strong-950">{c.code}</span></Table.Cell>
            <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-text-strong-950">{c.label}</span></Table.Cell>
            <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{c.description ?? '—'}</Table.Cell>
            <Table.Cell className="h-auto py-3">
              <Badge.Root size="small" variant="lighter" color={TYPE_COLOR[c.charge_type] ?? 'gray'}>{TYPE_LABEL[c.charge_type]}</Badge.Root>
            </Table.Cell>
            <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{formatValue(c)}</Table.Cell>
            <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{c.applies_to ?? '—'}</Table.Cell>
            <Table.Cell className="h-auto py-3 text-right">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <CompactButton.Root variant="ghost" size="large" onClick={() => remove(c)} disabled={pending}>
                    <CompactButton.Icon as={RiDeleteBinLine} />
                  </CompactButton.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>Remove charge</Tooltip.Content>
              </Tooltip.Root>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
