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
import { RiEditLine, RiToggleLine } from '@remixicon/react';
import { editBranchAction, toggleBranchActiveAction } from './actions';
import type { BranchRow } from '@/lib/db/branches';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root>{label}{required ? <Label.Asterisk /> : null}</Label.Root>
      {children}
    </div>
  );
}

export default function RowActions({ row }: { row: BranchRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    code: row.code,
    name: row.name,
    alias: row.alias ?? '',
    branchType: row.branch_type,
    email: row.email ?? '',
    phone: row.phone ?? '',
    addressLine: row.address_line ?? '',
    country: row.country ?? 'India',
    state: row.state ?? '',
    city: row.city ?? '',
    pincode: row.pincode ?? '',
    operatingCities: row.operating_cities ?? '',
    headName: row.head_name ?? '',
    headEmail: row.head_email ?? '',
    headPhone: row.head_phone ?? '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  function onEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set('id', row.id);
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    startTransition(async () => {
      const r = await editBranchAction(fd);
      if (r.ok) { toast.success('Branch updated'); setOpen(false); router.refresh(); }
      else toast.error(r.error);
    });
  }

  function onToggle() {
    startTransition(async () => {
      await toggleBranchActiveAction(row.id, !row.is_active);
      toast.success(row.is_active ? 'Deactivated' : 'Activated');
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
        <Tooltip.Content>Edit branch</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <CompactButton.Root variant="ghost" size="large" onClick={onToggle} disabled={pending}>
            <CompactButton.Icon as={RiToggleLine} />
          </CompactButton.Root>
        </Tooltip.Trigger>
        <Tooltip.Content>{row.is_active ? 'Deactivate' : 'Activate'}</Tooltip.Content>
      </Tooltip.Root>

      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-lg">
          <Modal.Header title="Edit Branch" description="Update branch details" />
          <form onSubmit={onEdit}>
            <Modal.Body className="max-h-[60vh] space-y-3 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Code" required>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.code} onChange={set('code')} required />
                  </Input.Wrapper></Input.Root>
                </Field>
                <Field label="Type" required>
                  <Select.Root size="small" value={form.branchType} onValueChange={(v) => setForm((s) => ({ ...s, branchType: v }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="hub">Hub</Select.Item>
                      <Select.Item value="branch">Branch</Select.Item>
                      <Select.Item value="franchise">Franchise</Select.Item>
                      <Select.Item value="vendor">Vendor</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" required>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.name} onChange={set('name')} required />
                  </Input.Wrapper></Input.Root>
                </Field>
                <Field label="Alias">
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.alias} onChange={set('alias')} />
                  </Input.Wrapper></Input.Root>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email">
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input type="email" value={form.email} onChange={set('email')} />
                  </Input.Wrapper></Input.Root>
                </Field>
                <Field label="Phone">
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.phone} onChange={set('phone')} />
                  </Input.Wrapper></Input.Root>
                </Field>
              </div>
              <Field label="Address">
                <Input.Root size="small"><Input.Wrapper>
                  <Input.Input value={form.addressLine} onChange={set('addressLine')} />
                </Input.Wrapper></Input.Root>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Country">
                  <Select.Root size="small" value={form.country} onValueChange={(v) => setForm((s) => ({ ...s, country: v }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="India">India</Select.Item>
                      <Select.Item value="Nepal">Nepal</Select.Item>
                      <Select.Item value="Bhutan">Bhutan</Select.Item>
                      <Select.Item value="Bangladesh">Bangladesh</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Field>
                <Field label="Operating Cities">
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.operatingCities} onChange={set('operatingCities')} placeholder="Comma-separated" />
                  </Input.Wrapper></Input.Root>
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="City">
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.city} onChange={set('city')} />
                  </Input.Wrapper></Input.Root>
                </Field>
                <Field label="State">
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.state} onChange={set('state')} />
                  </Input.Wrapper></Input.Root>
                </Field>
                <Field label="Pincode">
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.pincode} onChange={set('pincode')} />
                  </Input.Wrapper></Input.Root>
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Head Name">
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.headName} onChange={set('headName')} />
                  </Input.Wrapper></Input.Root>
                </Field>
                <Field label="Head Email">
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input type="email" value={form.headEmail} onChange={set('headEmail')} />
                  </Input.Wrapper></Input.Root>
                </Field>
                <Field label="Head Phone">
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.headPhone} onChange={set('headPhone')} />
                  </Input.Wrapper></Input.Root>
                </Field>
              </div>
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
