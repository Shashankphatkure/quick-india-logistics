'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { RiAddLine } from '@remixicon/react';
import { addAssetAction } from './actions';

export default function AddAssetForm({ branches }: { branches: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    assetKind: 'logger' as 'logger' | 'box',
    assetId: '', barcode: '',
    loggerType: 'multi_use', boxType: 'credo',
    capacityLiters: '', manufacturer: '', branchId: '',
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await addAssetAction(fd);
      if (r.ok) {
        toast.success('Asset added');
        setForm({ assetKind: 'logger', assetId: '', barcode: '', loggerType: 'multi_use', boxType: 'credo', capacityLiters: '', manufacturer: '', branchId: '' });
        setOpen(false);
      } else toast.error(r.error);
    });
  }

  return (
    <>
      <Button.Root size="small" onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />Add Asset
      </Button.Root>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-lg">
          <Modal.Header title="Add Asset" description="Register a new logger or temperature-control box" />
          <form onSubmit={onSubmit}>
            <Modal.Body className="space-y-3 p-5">
              <input type="hidden" name="assetKind" value={form.assetKind} />
              <input type="hidden" name="loggerType" value={form.assetKind === 'logger' ? form.loggerType : ''} />
              <input type="hidden" name="boxType" value={form.assetKind === 'box' ? form.boxType : ''} />
              <input type="hidden" name="branchId" value={form.branchId} />

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
                  <Input.Root size="small"><Input.Wrapper><Input.Input name="assetId" value={form.assetId} onChange={(e) => setForm((s) => ({ ...s, assetId: e.target.value.toUpperCase() }))} placeholder={form.assetKind === 'logger' ? 'LOG-####' : 'BOX-####'} required /></Input.Wrapper></Input.Root>
                </F>
                <F label="Barcode">
                  <Input.Root size="small"><Input.Wrapper><Input.Input name="barcode" value={form.barcode} onChange={(e) => setForm((s) => ({ ...s, barcode: e.target.value.toUpperCase() }))} placeholder="BAR-####" /></Input.Wrapper></Input.Root>
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
                    <Input.Root size="small"><Input.Wrapper><Input.Input name="capacityLiters" type="number" step="0.1" value={form.capacityLiters} onChange={(e) => setForm((s) => ({ ...s, capacityLiters: e.target.value }))} placeholder="4" /></Input.Wrapper></Input.Root>
                  </F>
                </div>
              )}

              <F label="Manufacturer">
                <Input.Root size="small"><Input.Wrapper><Input.Input name="manufacturer" value={form.manufacturer} onChange={(e) => setForm((s) => ({ ...s, manufacturer: e.target.value }))} placeholder="e.g. Sensitech" /></Input.Wrapper></Input.Root>
              </F>
              <F label="Assigned Branch">
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
              <Button.Root size="small" type="submit" disabled={pending}>{pending ? 'Saving...' : 'Add Asset'}</Button.Root>
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}

function F({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root>{label}{required && <Label.Asterisk />}</Label.Root>
      {children}
    </div>
  );
}
