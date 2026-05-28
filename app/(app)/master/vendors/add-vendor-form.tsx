'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { RiAddLine } from '@remixicon/react';
import { addVendorAction } from './actions';

export default function AddVendorForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: '', pan: '', companyType: 'Pvt Ltd', serviceRegion: 'pan_india',
    lineOfBusiness: '', primaryEmail: '', primaryPhone: '',
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await addVendorAction(fd);
      if (r.ok) {
        toast.success('Vendor added (pending approval)');
        setForm({ name: '', pan: '', companyType: 'Pvt Ltd', serviceRegion: 'pan_india', lineOfBusiness: '', primaryEmail: '', primaryPhone: '' });
        setOpen(false);
      } else toast.error(r.error);
    });
  }

  return (
    <>
      <Button.Root size="small" onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />Add Vendor
      </Button.Root>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-2xl">
          <Modal.Header title="Add Vendor" description="Create a new coloader / vendor" />
          <form onSubmit={onSubmit}>
            <Modal.Body className="space-y-3 p-5">
              <input type="hidden" name="companyType" value={form.companyType} />
              <input type="hidden" name="serviceRegion" value={form.serviceRegion} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <F label="Vendor Name" required>
                  <Input.Root size="small"><Input.Wrapper><Input.Input name="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required /></Input.Wrapper></Input.Root>
                </F>
                <F label="PAN">
                  <Input.Root size="small"><Input.Wrapper><Input.Input name="pan" value={form.pan} onChange={(e) => setForm((s) => ({ ...s, pan: e.target.value.toUpperCase() }))} placeholder="AAACX1234X" /></Input.Wrapper></Input.Root>
                </F>
                <F label="Company Type">
                  <Select.Root size="small" value={form.companyType} onValueChange={(v) => setForm((s) => ({ ...s, companyType: v }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="Pvt Ltd">Pvt Ltd</Select.Item>
                      <Select.Item value="LLP">LLP</Select.Item>
                      <Select.Item value="Proprietorship">Proprietorship</Select.Item>
                      <Select.Item value="Partnership">Partnership</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </F>
                <F label="Service Region">
                  <Select.Root size="small" value={form.serviceRegion} onValueChange={(v) => setForm((s) => ({ ...s, serviceRegion: v }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="pan_india">Pan India</Select.Item>
                      <Select.Item value="state">State</Select.Item>
                      <Select.Item value="city">City</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </F>
                <F label="Line of Business">
                  <Input.Root size="small"><Input.Wrapper><Input.Input name="lineOfBusiness" value={form.lineOfBusiness} onChange={(e) => setForm((s) => ({ ...s, lineOfBusiness: e.target.value }))} placeholder="e.g. Coloader" /></Input.Wrapper></Input.Root>
                </F>
                <F label="Primary Email">
                  <Input.Root size="small"><Input.Wrapper><Input.Input name="primaryEmail" type="email" value={form.primaryEmail} onChange={(e) => setForm((s) => ({ ...s, primaryEmail: e.target.value }))} /></Input.Wrapper></Input.Root>
                </F>
                <F label="Primary Phone">
                  <Input.Root size="small"><Input.Wrapper><Input.Input name="primaryPhone" value={form.primaryPhone} onChange={(e) => setForm((s) => ({ ...s, primaryPhone: e.target.value }))} /></Input.Wrapper></Input.Root>
                </F>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
              <Button.Root size="small" type="submit" disabled={pending}>{pending ? 'Saving...' : 'Add Vendor'}</Button.Root>
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
