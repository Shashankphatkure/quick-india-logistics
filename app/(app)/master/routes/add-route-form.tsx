'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Drawer from '@/components/ui/drawer';
import * as Divider from '@/components/ui/divider';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { RiAddLine, RiRouteLine } from '@remixicon/react';
import { addRouteAction } from './actions';

type Option = { id: string; name: string };

const MODES: { value: string; label: string }[] = [
  { value: 'surface', label: 'Surface' }, { value: 'air', label: 'Air' },
  { value: 'local', label: 'Local' }, { value: 'cargo', label: 'Cargo' },
  { value: 'train', label: 'Train' }, { value: 'courier', label: 'Courier' },
  { value: 'warehouse', label: 'Warehouse' },
];

const INITIAL = { clientId: '', mode: 'surface', originBranchId: '', destinationBranchId: '', tatHours: '', ratePerKg: '' };

export default function AddRouteForm({ clients, branches }: { clients: Option[]; branches: Option[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof typeof INITIAL>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function submit(addAnother: boolean) {
    if (!form.clientId) { toast.error('Select a client'); return; }
    if (!form.originBranchId || !form.destinationBranchId) { toast.error('Select origin and destination'); return; }
    if (!(Number(form.tatHours) > 0)) { toast.error('Enter TAT hours'); return; }
    const fd = new FormData();
    fd.set('clientId', form.clientId);
    fd.set('mode', form.mode);
    fd.set('originBranchId', form.originBranchId);
    fd.set('destinationBranchId', form.destinationBranchId);
    fd.set('tatHours', form.tatHours);
    fd.set('ratePerKg', form.ratePerKg);
    startTransition(async () => {
      const r = await addRouteAction(fd);
      if (r.ok) {
        toast.success('Route added');
        setForm(addAnother ? { ...INITIAL, clientId: form.clientId, mode: form.mode } : INITIAL);
        if (!addAnother) setOpen(false);
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <>
      <Button.Root size="small" onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />Add Route
      </Button.Root>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Content className="max-w-[520px]">
          <Drawer.Header>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-information-lighter text-information-base">
              <RiRouteLine size={20} />
            </div>
            <div className="flex-1">
              <Drawer.Title>Add Route</Drawer.Title>
              <p className="text-paragraph-sm text-text-sub-600">Per-client TAT &amp; rate for a lane</p>
            </div>
          </Drawer.Header>
          <Divider.Root />

          <form onSubmit={(e) => { e.preventDefault(); submit(false); }} className="contents">
            <Drawer.Body className="space-y-4 p-5">
              <div className="flex flex-col gap-1.5">
                <Label.Root>Client <Label.Asterisk /></Label.Root>
                <Select.Root size="small" value={form.clientId} onValueChange={(v) => set('clientId', v)}>
                  <Select.Trigger><Select.Value placeholder="Select client" /></Select.Trigger>
                  <Select.Content>
                    {clients.map((c) => <Select.Item key={c.id} value={c.id}>{c.name}</Select.Item>)}
                  </Select.Content>
                </Select.Root>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>Mode <Label.Asterisk /></Label.Root>
                <Select.Root size="small" value={form.mode} onValueChange={(v) => set('mode', v)}>
                  <Select.Trigger><Select.Value /></Select.Trigger>
                  <Select.Content>
                    {MODES.map((m) => <Select.Item key={m.value} value={m.value}>{m.label}</Select.Item>)}
                  </Select.Content>
                </Select.Root>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Origin <Label.Asterisk /></Label.Root>
                  <Select.Root size="small" value={form.originBranchId} onValueChange={(v) => set('originBranchId', v)}>
                    <Select.Trigger><Select.Value placeholder="Origin" /></Select.Trigger>
                    <Select.Content>
                      {branches.map((b) => <Select.Item key={b.id} value={b.id}>{b.name}</Select.Item>)}
                    </Select.Content>
                  </Select.Root>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Destination <Label.Asterisk /></Label.Root>
                  <Select.Root size="small" value={form.destinationBranchId} onValueChange={(v) => set('destinationBranchId', v)}>
                    <Select.Trigger><Select.Value placeholder="Destination" /></Select.Trigger>
                    <Select.Content>
                      {branches.map((b) => <Select.Item key={b.id} value={b.id}>{b.name}</Select.Item>)}
                    </Select.Content>
                  </Select.Root>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label.Root>TAT (hours) <Label.Asterisk /></Label.Root>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input type="number" min={1} value={form.tatHours} onChange={(e) => set('tatHours', e.target.value)} placeholder="48" />
                  </Input.Wrapper></Input.Root>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Rate (₹/kg)</Label.Root>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input type="number" step="0.01" value={form.ratePerKg} onChange={(e) => set('ratePerKg', e.target.value)} placeholder="0.00" />
                  </Input.Wrapper></Input.Root>
                </div>
              </div>
            </Drawer.Body>

            <Divider.Root />
            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button.Root variant="neutral" mode="stroke" size="small" type="button" className="w-full">Cancel</Button.Root>
              </Drawer.Close>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" className="w-full" disabled={pending} onClick={() => submit(true)}>
                Save &amp; Add Another
              </Button.Root>
              <Button.Root size="small" className="w-full" type="submit" disabled={pending}>
                {pending ? 'Saving...' : 'Save Route'}
              </Button.Root>
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
