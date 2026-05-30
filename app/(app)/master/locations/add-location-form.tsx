'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { RiAddLine } from '@remixicon/react';
import { addLocationAction } from './actions';

const INITIAL = { country: 'India', pincode: '', state: '', city: '', assignedBranchId: '' };

export default function AddLocationForm({ branches }: { branches: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(INITIAL);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((s) => ({ ...s, [k]: e.target.value }));

  function submit(addAnother: boolean) {
    if (!form.state.trim() || !form.city.trim()) { toast.error('State and City are required'); return; }
    const fd = new FormData();
    fd.set('country', form.country);
    fd.set('pincode', form.pincode);
    fd.set('state', form.state);
    fd.set('city', form.city);
    fd.set('assignedBranchId', form.assignedBranchId);
    startTransition(async () => {
      const r = await addLocationAction(fd);
      if (r.ok) {
        toast.success('Location added');
        setForm((s) => ({ ...INITIAL, country: s.country, state: s.state, assignedBranchId: s.assignedBranchId }));
        if (!addAnother) setOpen(false);
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <>
      <Button.Root size="small" onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />Add Location
      </Button.Root>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-lg">
          <Modal.Header title="Add Location" description="Country → Pincode → State → City → Branch" />
          <form onSubmit={(e) => { e.preventDefault(); submit(false); }}>
            <Modal.Body className="space-y-3 p-5">
              {/* Sequence: Country → Pincode → State → City → Branch */}
              <div className="grid grid-cols-2 gap-3">
                <F label="Country" required>
                  <Select.Root size="small" value={form.country} onValueChange={(v) => setForm((s) => ({ ...s, country: v }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="India">India</Select.Item>
                      <Select.Item value="Nepal">Nepal</Select.Item>
                      <Select.Item value="Bhutan">Bhutan</Select.Item>
                      <Select.Item value="Bangladesh">Bangladesh</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </F>
                <F label="Pincode">
                  <Input.Root size="small"><Input.Wrapper><Input.Input value={form.pincode} onChange={set('pincode')} placeholder="6 digits" /></Input.Wrapper></Input.Root>
                </F>
                <F label="State" required>
                  <Input.Root size="small"><Input.Wrapper><Input.Input value={form.state} onChange={set('state')} placeholder="State" required /></Input.Wrapper></Input.Root>
                </F>
                <F label="City" required>
                  <Input.Root size="small"><Input.Wrapper><Input.Input value={form.city} onChange={set('city')} placeholder="City" required /></Input.Wrapper></Input.Root>
                </F>
              </div>
              <F label="Assigned Branch">
                <Select.Root size="small" value={form.assignedBranchId} onValueChange={(v) => setForm((s) => ({ ...s, assignedBranchId: v }))}>
                  <Select.Trigger><Select.Value placeholder="Select branch" /></Select.Trigger>
                  <Select.Content>
                    {branches.map((b) => <Select.Item key={b.id} value={b.id}>{b.name}</Select.Item>)}
                  </Select.Content>
                </Select.Root>
              </F>
            </Modal.Body>
            <Modal.Footer>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" disabled={pending} onClick={() => submit(true)}>Save &amp; Add Another</Button.Root>
              <Button.Root size="small" type="submit" disabled={pending}>{pending ? 'Saving...' : 'Add Location'}</Button.Root>
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
