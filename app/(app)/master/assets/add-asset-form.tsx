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
import { RiAddLine, RiSuitcaseLine } from '@remixicon/react';
import { addAssetAction } from './actions';

const MANUFACTURERS = ['Sensitech', 'EM-TC', 'Logtag', 'Berlinger', 'Va-Q-Tec', 'Credo Cube', 'Cold Chain Tech', 'Other'];

const INITIAL = {
  assetKind: 'logger' as 'logger' | 'box',
  assetId: '', barcode: '',
  loggerType: 'multi_use', boxType: 'credo',
  capacityLiters: '', manufacturer: 'Sensitech',
  loggerNumber: '', oldBoxNumber: '',
  calFrom: '', calTo: '', calIssuer: '',
  branchId: '',
};

export default function AddAssetForm({ branches }: { branches: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(INITIAL);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((s) => ({ ...s, [k]: e.target.value }));

  function submit(addAnother: boolean) {
    if (!form.assetId.trim()) { toast.error('Asset ID is required'); return; }
    const fd = new FormData();
    fd.set('assetKind', form.assetKind);
    fd.set('assetId', form.assetId);
    fd.set('barcode', form.barcode);
    fd.set('loggerType', form.assetKind === 'logger' ? form.loggerType : '');
    fd.set('boxType', form.assetKind === 'box' ? form.boxType : '');
    fd.set('capacityLiters', form.assetKind === 'box' ? form.capacityLiters : '');
    fd.set('manufacturer', form.manufacturer);
    fd.set('loggerNumber', form.loggerNumber);
    fd.set('oldBoxNumber', form.oldBoxNumber);
    fd.set('calFrom', form.calFrom);
    fd.set('calTo', form.calTo);
    fd.set('calIssuer', form.calIssuer);
    fd.set('branchId', form.branchId);
    startTransition(async () => {
      const r = await addAssetAction(fd);
      if (r.ok) {
        toast.success('Asset added');
        setForm((s) => ({ ...INITIAL, assetKind: s.assetKind, branchId: s.branchId, manufacturer: s.manufacturer }));
        if (!addAnother) setOpen(false);
        router.refresh();
      } else toast.error(r.error);
    });
  }

  const isLogger = form.assetKind === 'logger';

  return (
    <>
      <Button.Root size="small" onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />Add Asset
      </Button.Root>
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Content className="max-w-[640px]">
          <Drawer.Header>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-feature-lighter text-feature-base">
              <RiSuitcaseLine size={20} />
            </div>
            <div className="flex-1">
              <Drawer.Title>Add Asset</Drawer.Title>
              <p className="text-paragraph-sm text-text-sub-600">Register a new logger or temperature-control box</p>
            </div>
          </Drawer.Header>
          <Divider.Root />

          <form onSubmit={(e) => { e.preventDefault(); submit(false); }} className="contents">
            <Drawer.Body className="space-y-5 overflow-y-auto p-5">
              <section className="space-y-3">
                <h4 className="text-subheading-xs uppercase text-text-sub-600">Identity</h4>
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
                    <Input.Root size="small"><Input.Wrapper><Input.Input value={form.assetId} onChange={(e) => setForm((s) => ({ ...s, assetId: e.target.value.toUpperCase() }))} placeholder={isLogger ? 'LOG-####' : 'BOX-####'} required /></Input.Wrapper></Input.Root>
                  </F>
                  <F label="Barcode">
                    <Input.Root size="small"><Input.Wrapper><Input.Input value={form.barcode} onChange={(e) => setForm((s) => ({ ...s, barcode: e.target.value.toUpperCase() }))} placeholder="BAR-####" /></Input.Wrapper></Input.Root>
                  </F>
                </div>
                <F label="Manufacturer">
                  <Select.Root size="small" value={form.manufacturer} onValueChange={(v) => setForm((s) => ({ ...s, manufacturer: v }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      {MANUFACTURERS.map((m) => <Select.Item key={m} value={m}>{m}</Select.Item>)}
                    </Select.Content>
                  </Select.Root>
                </F>
              </section>

              {isLogger ? (
                <section className="space-y-3">
                  <h4 className="text-subheading-xs uppercase text-text-sub-600">Logger Details</h4>
                  <div className="grid grid-cols-2 gap-3">
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
                    <F label="Logger Number">
                      <Input.Root size="small"><Input.Wrapper><Input.Input value={form.loggerNumber} onChange={set('loggerNumber')} placeholder="Serial / PID" /></Input.Wrapper></Input.Root>
                    </F>
                  </div>
                </section>
              ) : (
                <section className="space-y-3">
                  <h4 className="text-subheading-xs uppercase text-text-sub-600">Box Details</h4>
                  <div className="grid grid-cols-3 gap-3">
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
                    <F label="Capacity (L)" required>
                      <Input.Root size="small"><Input.Wrapper><Input.Input type="number" step="0.1" min="0.1" value={form.capacityLiters} onChange={set('capacityLiters')} placeholder="1.0" /></Input.Wrapper></Input.Root>
                    </F>
                    <F label="Old Box Number">
                      <Input.Root size="small"><Input.Wrapper><Input.Input value={form.oldBoxNumber} onChange={set('oldBoxNumber')} placeholder="Legacy no." /></Input.Wrapper></Input.Root>
                    </F>
                  </div>
                </section>
              )}

              {isLogger && (
                <section className="space-y-3">
                  <h4 className="text-subheading-xs uppercase text-text-sub-600">Calibration Info</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <F label="Calibrated From">
                      <Input.Root size="small"><Input.Wrapper><Input.Input type="date" value={form.calFrom} onChange={set('calFrom')} /></Input.Wrapper></Input.Root>
                    </F>
                    <F label="Calibrated To">
                      <Input.Root size="small"><Input.Wrapper><Input.Input type="date" value={form.calTo} onChange={set('calTo')} /></Input.Wrapper></Input.Root>
                    </F>
                    <F label="Issued By">
                      <Input.Root size="small"><Input.Wrapper><Input.Input value={form.calIssuer} onChange={set('calIssuer')} placeholder="Cal. lab" /></Input.Wrapper></Input.Root>
                    </F>
                  </div>
                </section>
              )}

              <section className="space-y-3">
                <h4 className="text-subheading-xs uppercase text-text-sub-600">Assignment</h4>
                <F label="Initial Assigned Branch">
                  <Select.Root size="small" value={form.branchId} onValueChange={(v) => setForm((s) => ({ ...s, branchId: v }))}>
                    <Select.Trigger><Select.Value placeholder="Select branch" /></Select.Trigger>
                    <Select.Content>
                      {branches.map((b) => <Select.Item key={b.id} value={b.id}>{b.name}</Select.Item>)}
                    </Select.Content>
                  </Select.Root>
                </F>
              </section>
            </Drawer.Body>

            <Divider.Root />
            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button.Root variant="neutral" mode="stroke" size="small" type="button" className="w-full">Cancel</Button.Root>
              </Drawer.Close>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" className="w-full" disabled={pending} onClick={() => submit(true)}>
                Save &amp; Add Another
              </Button.Root>
              <Button.Root size="small" type="submit" className="w-full" disabled={pending}>{pending ? 'Saving...' : 'Add Asset'}</Button.Root>
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer.Root>
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
