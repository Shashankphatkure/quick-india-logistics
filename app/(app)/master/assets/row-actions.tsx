'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import * as Tooltip from '@/components/ui/tooltip';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { RiEditLine, RiAlarmWarningLine, RiCheckLine } from '@remixicon/react';
import { editAssetAction, toggleAssetDefectiveAction } from './actions';
import type { AssetRow } from '@/lib/db/assets';

function F({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root>{label}{required ? <Label.Asterisk /> : null}</Label.Root>
      {children}
    </div>
  );
}

export default function RowActions({ row, branches }: { row: AssetRow; branches: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    assetKind: (row.asset_kind === 'box' ? 'box' : 'logger') as 'logger' | 'box',
    assetId: row.asset_id,
    barcode: row.barcode ?? '',
    loggerType: row.logger_type ?? 'multi_use',
    boxType: row.box_type ?? 'credo',
    capacityLiters: row.capacity_liters ?? '',
    manufacturer: row.manufacturer ?? '',
    branchId: row.current_branch_id ?? '',
  });

  function onEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set('id', row.id);
    fd.set('assetId', form.assetId);
    fd.set('barcode', form.barcode);
    fd.set('assetKind', form.assetKind);
    fd.set('loggerType', form.assetKind === 'logger' ? form.loggerType : '');
    fd.set('boxType', form.assetKind === 'box' ? form.boxType : '');
    fd.set('capacityLiters', form.assetKind === 'box' ? form.capacityLiters : '');
    fd.set('manufacturer', form.manufacturer);
    fd.set('branchId', form.branchId);
    startTransition(async () => {
      const r = await editAssetAction(fd);
      if (r.ok) { toast.success('Asset updated'); setOpen(false); router.refresh(); }
      else toast.error(r.error);
    });
  }

  function onToggleDefective() {
    startTransition(async () => {
      await toggleAssetDefectiveAction(row.id, !row.is_defective);
      toast.success(row.is_defective ? 'Marked repaired' : 'Marked defective');
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <CompactButton.Root variant="ghost" size="large" onClick={() => setOpen(true)}>
            <CompactButton.Icon as={RiEditLine} />
          </CompactButton.Root>
        </Tooltip.Trigger>
        <Tooltip.Content>Edit asset</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <CompactButton.Root variant="ghost" size="large" onClick={onToggleDefective} disabled={pending}>
            <CompactButton.Icon as={row.is_defective ? RiCheckLine : RiAlarmWarningLine} />
          </CompactButton.Root>
        </Tooltip.Trigger>
        <Tooltip.Content>{row.is_defective ? 'Mark repaired' : 'Mark defective'}</Tooltip.Content>
      </Tooltip.Root>

      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-lg">
          <Modal.Header title="Edit Asset" description="Update logger or box details" />
          <form onSubmit={onEdit}>
            <Modal.Body className="space-y-3 p-5">
              <F label="Asset Kind" required>
                <Select.Root size="small" value={form.assetKind} onValueChange={(v) => setForm((s) => ({ ...s, assetKind: v as 'logger' | 'box' }))}>
                  <Select.Trigger><Select.Value /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="logger">Logger</Select.Item>
                    <Select.Item value="box">Temperature Control Box</Select.Item>
                  </Select.Content>
                </Select.Root>
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Asset ID" required>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.assetId} onChange={(e) => setForm((s) => ({ ...s, assetId: e.target.value.toUpperCase() }))} required />
                  </Input.Wrapper></Input.Root>
                </F>
                <F label="Barcode">
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.barcode} onChange={(e) => setForm((s) => ({ ...s, barcode: e.target.value.toUpperCase() }))} />
                  </Input.Wrapper></Input.Root>
                </F>
              </div>
              {form.assetKind === 'logger' ? (
                <F label="Logger Type">
                  <Select.Root size="small" value={form.loggerType} onValueChange={(v) => setForm((s) => ({ ...s, loggerType: v }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="single_use">Single Use</Select.Item>
                      <Select.Item value="multi_use">Multi Use</Select.Item>
                      <Select.Item value="dry_ice_single">Dry Ice (Single)</Select.Item>
                      <Select.Item value="dry_ice_multi">Dry Ice (Multi)</Select.Item>
                      <Select.Item value="liquid_nitrogen">Liquid Nitrogen</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </F>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <F label="Box Type">
                    <Select.Root size="small" value={form.boxType} onValueChange={(v) => setForm((s) => ({ ...s, boxType: v }))}>
                      <Select.Trigger><Select.Value /></Select.Trigger>
                      <Select.Content>
                        <Select.Item value="credo">Credo</Select.Item>
                        <Select.Item value="vype">Vype</Select.Item>
                        <Select.Item value="cool_guard">Cool Guard</Select.Item>
                        <Select.Item value="iqo">IQO</Select.Item>
                        <Select.Item value="sytle">Sytle</Select.Item>
                        <Select.Item value="vaq_tec">VAQ-TEC</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </F>
                  <F label="Capacity (L)">
                    <Input.Root size="small"><Input.Wrapper>
                      <Input.Input type="number" step="0.1" value={form.capacityLiters} onChange={(e) => setForm((s) => ({ ...s, capacityLiters: e.target.value }))} />
                    </Input.Wrapper></Input.Root>
                  </F>
                </div>
              )}
              <F label="Manufacturer">
                <Input.Root size="small"><Input.Wrapper>
                  <Input.Input value={form.manufacturer} onChange={(e) => setForm((s) => ({ ...s, manufacturer: e.target.value }))} />
                </Input.Wrapper></Input.Root>
              </F>
              <F label="Current Branch">
                <Select.Root size="small" value={form.branchId} onValueChange={(v) => setForm((s) => ({ ...s, branchId: v }))}>
                  <Select.Trigger><Select.Value placeholder="Select branch" /></Select.Trigger>
                  <Select.Content>
                    {branches.map((b) => <Select.Item key={b.id} value={b.id}>{b.name}</Select.Item>)}
                  </Select.Content>
                </Select.Root>
              </F>
            </Modal.Body>
            <Modal.Footer>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
              <Button.Root size="small" type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save'}</Button.Root>
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}
