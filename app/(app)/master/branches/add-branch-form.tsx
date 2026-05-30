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
import { RiAddLine, RiStore2Line } from '@remixicon/react';
import { addBranchAction } from './actions';

const BRANCH_TYPES = [
  { value: 'hub', label: 'Hub' },
  { value: 'branch', label: 'Branch' },
  { value: 'franchise', label: 'Franchise' },
  { value: 'vendor', label: 'Vendor' },
];

export default function AddBranchForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [branchType, setBranchType] = useState('branch');
  const [country, setCountry] = useState('India');
  const [pending, startTransition] = useTransition();

  function submit(form: HTMLFormElement, addAnother: boolean) {
    const fd = new FormData(form);
    fd.set('branchType', branchType);
    fd.set('country', country);
    startTransition(async () => {
      const r = await addBranchAction(fd);
      if (r.ok) {
        toast.success('Branch added');
        form.reset();
        setBranchType('branch');
        setCountry('India');
        if (!addAnother) setOpen(false);
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit(e.currentTarget, false);
  }

  return (
    <>
      <Button.Root size="small" onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />
        Add Branch
      </Button.Root>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Content className="max-w-[760px]">
          <Drawer.Header>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-away-lighter text-away-base">
              <RiStore2Line size={20} />
            </div>
            <div className="flex-1">
              <Drawer.Title>Add Branch</Drawer.Title>
              <p className="text-paragraph-sm text-text-sub-600">Create a new branch location</p>
            </div>
          </Drawer.Header>
          <Divider.Root />

          <form onSubmit={onSubmit} className="contents">
            <Drawer.Body className="space-y-6 overflow-y-auto p-5">
              <section className="space-y-3">
                <h4 className="text-subheading-xs uppercase text-text-sub-600">Branch Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Field label="Branch Type" required>
                    <Select.Root size="small" value={branchType} onValueChange={setBranchType}>
                      <Select.Trigger><Select.Value placeholder="Select type" /></Select.Trigger>
                      <Select.Content>
                        {BRANCH_TYPES.map((t) => <Select.Item key={t.value} value={t.value}>{t.label}</Select.Item>)}
                      </Select.Content>
                    </Select.Root>
                  </Field>
                  <Field label="Branch ID / Code" required>
                    <Input.Root size="small"><Input.Wrapper><Input.Input name="code" placeholder="QIL-CITY" required /></Input.Wrapper></Input.Root>
                  </Field>
                  <Field label="Branch Name" required>
                    <Input.Root size="small"><Input.Wrapper><Input.Input name="name" placeholder="QIL-CITY" required /></Input.Wrapper></Input.Root>
                  </Field>
                  <Field label="Alias Name">
                    <Input.Root size="small"><Input.Wrapper><Input.Input name="alias" placeholder="Display name" /></Input.Wrapper></Input.Root>
                  </Field>
                  <Field label="Branch Email">
                    <Input.Root size="small"><Input.Wrapper><Input.Input name="email" type="email" placeholder="branch@company.com" /></Input.Wrapper></Input.Root>
                  </Field>
                  <Field label="Branch Phone">
                    <Input.Root size="small"><Input.Wrapper><Input.Input name="phone" placeholder="98xxxxxxxx" /></Input.Wrapper></Input.Root>
                  </Field>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-subheading-xs uppercase text-text-sub-600">Location Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Field label="Country">
                    <Select.Root size="small" value={country} onValueChange={setCountry}>
                      <Select.Trigger><Select.Value /></Select.Trigger>
                      <Select.Content>
                        <Select.Item value="India">India</Select.Item>
                        <Select.Item value="Nepal">Nepal</Select.Item>
                        <Select.Item value="Bhutan">Bhutan</Select.Item>
                        <Select.Item value="Bangladesh">Bangladesh</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Field>
                  <Field label="State">
                    <Input.Root size="small"><Input.Wrapper><Input.Input name="state" placeholder="State" /></Input.Wrapper></Input.Root>
                  </Field>
                  <Field label="City">
                    <Input.Root size="small"><Input.Wrapper><Input.Input name="city" placeholder="City" /></Input.Wrapper></Input.Root>
                  </Field>
                  <Field label="Pincode">
                    <Input.Root size="small"><Input.Wrapper><Input.Input name="pincode" placeholder="6 digits" /></Input.Wrapper></Input.Root>
                  </Field>
                  <Field label="Address Line">
                    <Input.Root size="small"><Input.Wrapper><Input.Input name="addressLine" placeholder="Street, area" /></Input.Wrapper></Input.Root>
                  </Field>
                  <Field label="Operating Cities">
                    <Input.Root size="small"><Input.Wrapper><Input.Input name="operatingCities" placeholder="Chandigarh, Ludhiana, Patiala" /></Input.Wrapper></Input.Root>
                  </Field>
                </div>
                <p className="text-paragraph-xs text-text-disabled-300">Operating Cities: comma-separated cities this branch serves.</p>
              </section>

              <section className="space-y-3">
                <h4 className="text-subheading-xs uppercase text-text-sub-600">Branch Head</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Field label="Br. Head Name">
                    <Input.Root size="small"><Input.Wrapper><Input.Input name="headName" placeholder="Full name" /></Input.Wrapper></Input.Root>
                  </Field>
                  <Field label="Br. Head Email">
                    <Input.Root size="small"><Input.Wrapper><Input.Input name="headEmail" type="email" placeholder="head@company.com" /></Input.Wrapper></Input.Root>
                  </Field>
                  <Field label="Br. Head Phone">
                    <Input.Root size="small"><Input.Wrapper><Input.Input name="headPhone" placeholder="98xxxxxxxx" /></Input.Wrapper></Input.Root>
                  </Field>
                </div>
              </section>
            </Drawer.Body>

            <Divider.Root />
            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button.Root variant="neutral" mode="stroke" size="small" type="button" className="w-full">Cancel</Button.Root>
              </Drawer.Close>
              <Button.Root
                variant="neutral"
                mode="stroke"
                size="small"
                type="button"
                className="w-full"
                disabled={pending}
                onClick={(e) => {
                  const form = e.currentTarget.closest('form') as HTMLFormElement | null;
                  if (form?.reportValidity()) submit(form, true);
                }}
              >
                Save &amp; Add Another
              </Button.Root>
              <Button.Root size="small" className="w-full" type="submit" disabled={pending}>
                {pending ? 'Saving...' : 'Save Branch'}
              </Button.Root>
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer.Root>
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
