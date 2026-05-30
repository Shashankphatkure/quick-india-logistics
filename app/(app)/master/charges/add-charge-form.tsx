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
import * as Textarea from '@/components/ui/textarea';
import { RiAddLine, RiMoneyRupeeCircleLine } from '@remixicon/react';
import { addChargeAction } from './actions';

const TYPES: { value: string; label: string }[] = [
  { value: 'flat', label: 'Flat (₹)' },
  { value: 'percent', label: 'Percent (%)' },
  { value: 'per_kg', label: 'Per Kg (₹/kg)' },
  { value: 'per_box', label: 'Per Box (₹/box)' },
];

const INITIAL = { code: '', label: '', description: '', chargeType: 'flat', defaultValue: '', appliesTo: '' };

export default function AddChargeForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof typeof INITIAL>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function submit(addAnother: boolean) {
    if (!form.code.trim()) { toast.error('Enter a charge code'); return; }
    if (!form.label.trim()) { toast.error('Enter a charge name'); return; }
    const fd = new FormData();
    fd.set('code', form.code.trim());
    fd.set('label', form.label.trim());
    fd.set('description', form.description.trim());
    fd.set('chargeType', form.chargeType);
    fd.set('defaultValue', form.defaultValue);
    fd.set('appliesTo', form.appliesTo.trim());
    startTransition(async () => {
      const r = await addChargeAction(fd);
      if (r.ok) {
        toast.success('Charge added');
        setForm(addAnother ? { ...INITIAL, chargeType: form.chargeType } : INITIAL);
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
        <Button.Icon as={RiAddLine} />Add Charge
      </Button.Root>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Content className="max-w-[520px]">
          <Drawer.Header>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning-lighter text-warning-base">
              <RiMoneyRupeeCircleLine size={20} />
            </div>
            <div className="flex-1">
              <Drawer.Title>Add Charge</Drawer.Title>
              <p className="text-paragraph-sm text-text-sub-600">Define a surcharge / fare code applied during invoicing</p>
            </div>
          </Drawer.Header>
          <Divider.Root />

          <form onSubmit={(e) => { e.preventDefault(); submit(false); }} className="contents">
            <Drawer.Body className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Code <Label.Asterisk /></Label.Root>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="FUEL_SUR" autoFocus />
                  </Input.Wrapper></Input.Root>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Type <Label.Asterisk /></Label.Root>
                  <Select.Root size="small" value={form.chargeType} onValueChange={(v) => set('chargeType', v)}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      {TYPES.map((t) => <Select.Item key={t.value} value={t.value}>{t.label}</Select.Item>)}
                    </Select.Content>
                  </Select.Root>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>Charge Name <Label.Asterisk /></Label.Root>
                <Input.Root size="small"><Input.Wrapper>
                  <Input.Input value={form.label} onChange={(e) => set('label', e.target.value)} placeholder="Fuel Surcharge" />
                </Input.Wrapper></Input.Root>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Default Value</Label.Root>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input type="number" step="0.01" value={form.defaultValue} onChange={(e) => set('defaultValue', e.target.value)} placeholder="0" />
                  </Input.Wrapper></Input.Root>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Applies To</Label.Root>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.appliesTo} onChange={(e) => set('appliesTo', e.target.value)} placeholder="All freight" />
                  </Input.Wrapper></Input.Root>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>Description</Label.Root>
                <Textarea.Root simple value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="When and how this charge applies…" rows={2} />
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
                {pending ? 'Saving...' : 'Save Charge'}
              </Button.Root>
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
