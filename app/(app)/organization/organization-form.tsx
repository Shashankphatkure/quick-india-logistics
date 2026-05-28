'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import { RiSaveLine } from '@remixicon/react';
import { updateOrganizationAction } from './actions';

export type OrgRow = {
  id: string;
  name: string;
  legal_name: string | null;
  pan: string | null;
  tan: string | null;
  is_active: boolean;
};

export default function OrganizationForm({ org }: { org: OrgRow }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState({
    name: org.name,
    legalName: org.legal_name ?? '',
    pan: org.pan ?? '',
    tan: org.tan ?? '',
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await updateOrganizationAction(fd);
      if (r.ok) toast.success('Organization updated');
      else toast.error(r.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-6 shadow-regular-xs space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label.Root>Organization Name <Label.Asterisk /></Label.Root>
          <Input.Root size="small">
            <Input.Wrapper>
              <Input.Input name="name" value={state.name} onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))} required />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label.Root>Legal Name</Label.Root>
          <Input.Root size="small">
            <Input.Wrapper>
              <Input.Input name="legalName" value={state.legalName} onChange={(e) => setState((s) => ({ ...s, legalName: e.target.value }))} placeholder="Full registered name" />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label.Root>PAN</Label.Root>
          <Input.Root size="small">
            <Input.Wrapper>
              <Input.Input name="pan" value={state.pan} onChange={(e) => setState((s) => ({ ...s, pan: e.target.value.toUpperCase() }))} placeholder="AAACQ2341G" />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label.Root>TAN</Label.Root>
          <Input.Root size="small">
            <Input.Wrapper>
              <Input.Input name="tan" value={state.tan} onChange={(e) => setState((s) => ({ ...s, tan: e.target.value.toUpperCase() }))} placeholder="AAAA12345A" />
            </Input.Wrapper>
          </Input.Root>
        </div>
      </div>
      <div className="flex justify-end">
        <Button.Root size="small" type="submit" disabled={pending}>
          <Button.Icon as={RiSaveLine} />
          {pending ? 'Saving...' : 'Save Changes'}
        </Button.Root>
      </div>
    </form>
  );
}
