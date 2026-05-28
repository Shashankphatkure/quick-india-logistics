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
import { addCommodityAction } from './actions';
import type { CommodityType } from '@/lib/db/commodities';

export default function AddCommodityForm({ types }: { types: CommodityType[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState<string>('');
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addCommodityAction(fd);
      if (result.ok) {
        toast.success('Commodity added');
        setName('');
        setTypeId('');
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  if (!open) {
    return (
      <Button.Root size="small" onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />
        Add Commodity
      </Button.Root>
    );
  }

  return (
    <>
      <Button.Root size="small" onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />
        Add Commodity
      </Button.Root>
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-6 shadow-regular-xs space-y-5 col-span-full"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-label-sm text-text-strong-950">Add Commodity</h3>
            <p className="text-paragraph-xs text-text-sub-600 mt-0.5">
              Define a new commodity type
            </p>
          </div>
          <CompactButton.Root
            variant="ghost"
            size="large"
            type="button"
            onClick={() => setOpen(false)}
          >
            <CompactButton.Icon as={RiCloseLine} />
          </CompactButton.Root>
        </div>
        <Divider.Root />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label.Root>
              Commodity Type <Label.Asterisk />
            </Label.Root>
            <input type="hidden" name="typeId" value={typeId} />
            <Select.Root size="small" value={typeId} onValueChange={setTypeId}>
              <Select.Trigger>
                <Select.Value placeholder="Select type" />
              </Select.Trigger>
              <Select.Content>
                {types.map((t) => (
                  <Select.Item key={t.id} value={t.id}>
                    {t.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label.Root>
              Commodity Name <Label.Asterisk />
            </Label.Root>
            <Input.Root size="small">
              <Input.Wrapper>
                <Input.Input
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter commodity name"
                  required
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button.Root
            variant="neutral"
            mode="stroke"
            size="small"
            type="button"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button.Root>
          <Button.Root size="small" type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save Commodity'}
          </Button.Root>
        </div>
      </form>
    </>
  );
}
