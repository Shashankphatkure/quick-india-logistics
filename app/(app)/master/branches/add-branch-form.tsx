'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import * as Divider from '@/components/ui/divider';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { RiAddLine, RiCloseLine } from '@remixicon/react';
import { addBranchAction } from './actions';

const BRANCH_TYPES = [
  { value: 'hub', label: 'Hub' },
  { value: 'branch', label: 'Branch' },
  { value: 'franchise', label: 'Franchise' },
  { value: 'vendor', label: 'Vendor' },
];

export default function AddBranchForm() {
  const [open, setOpen] = useState(false);
  const [branchType, setBranchType] = useState('branch');
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await addBranchAction(fd);
      if (r.ok) {
        toast.success('Branch added');
        (e.target as HTMLFormElement).reset();
        setBranchType('branch');
        setOpen(false);
      } else {
        toast.error(r.error);
      }
    });
  }

  if (!open) {
    return (
      <Button.Root size="small" onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />
        Add Branch
      </Button.Root>
    );
  }

  return (
    <>
      <Button.Root size="small" onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />
        Add Branch
      </Button.Root>
      <form
        onSubmit={onSubmit}
        className="col-span-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-5 shadow-regular-xs space-y-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-label-sm text-text-strong-950">Add Branch</h3>
          <CompactButton.Root variant="ghost" size="large" type="button" onClick={() => setOpen(false)}>
            <CompactButton.Icon as={RiCloseLine} />
          </CompactButton.Root>
        </div>
        <Divider.Root />

        <section className="space-y-3">
          <h4 className="text-subheading-xs uppercase text-text-sub-600">Branch Info</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Branch Type" required>
              <input type="hidden" name="branchType" value={branchType} />
              <Select.Root size="small" value={branchType} onValueChange={setBranchType}>
                <Select.Trigger>
                  <Select.Value placeholder="Select type" />
                </Select.Trigger>
                <Select.Content>
                  {BRANCH_TYPES.map((t) => (
                    <Select.Item key={t.value} value={t.value}>
                      {t.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Field>
            <Field label="Branch Code" required>
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input name="code" placeholder="QIL-CITY" required />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Branch Name" required>
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input name="name" placeholder="QIL-CITY" required />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Alias Name">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input name="alias" placeholder="Display name" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Branch Email">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input name="email" type="email" placeholder="branch@company.com" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Branch Phone">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input name="phone" placeholder="98xxxxxxxx" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-subheading-xs uppercase text-text-sub-600">Location Info</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Address Line">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input name="addressLine" placeholder="Street, area" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="State">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input name="state" placeholder="State" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="City">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input name="city" placeholder="City" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Pincode">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input name="pincode" placeholder="6 digits" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-subheading-xs uppercase text-text-sub-600">Branch Head</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Head Name">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input name="headName" placeholder="Full name" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Head Email">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input name="headEmail" type="email" placeholder="head@company.com" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Head Phone">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input name="headPhone" placeholder="98xxxxxxxx" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Button.Root>
          <Button.Root size="small" type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save Branch'}
          </Button.Root>
        </div>
      </form>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root>
        {label}
        {required ? <Label.Asterisk /> : null}
      </Label.Root>
      {children}
    </div>
  );
}
