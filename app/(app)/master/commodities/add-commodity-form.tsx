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
import { RiAddLine, RiBox3Line } from '@remixicon/react';
import { addCommodityAction } from './actions';
import type { CommodityType } from '@/lib/db/commodities';

export default function AddCommodityForm({ types }: { types: CommodityType[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState<string>('');
  const [pending, startTransition] = useTransition();

  function submit(addAnother: boolean) {
    if (!typeId) { toast.error('Select a commodity type'); return; }
    if (!name.trim()) { toast.error('Enter a commodity name'); return; }
    const fd = new FormData();
    fd.set('typeId', typeId);
    fd.set('name', name.trim());
    startTransition(async () => {
      const result = await addCommodityAction(fd);
      if (result.ok) {
        toast.success('Commodity added');
        setName('');
        // Keep type selected for fast repeated entry; only clear name.
        if (!addAnother) setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <Button.Root size="small" onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />
        Add Commodity
      </Button.Root>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Content className="max-w-[520px]">
          <Drawer.Header>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-feature-lighter text-feature-base">
              <RiBox3Line size={20} />
            </div>
            <div className="flex-1">
              <Drawer.Title>Add Commodity</Drawer.Title>
              <p className="text-paragraph-sm text-text-sub-600">Define a new commodity type</p>
            </div>
          </Drawer.Header>
          <Divider.Root />

          <form onSubmit={(e) => { e.preventDefault(); submit(false); }} className="contents">
            <Drawer.Body className="space-y-4 p-5">
              <div className="flex flex-col gap-1.5">
                <Label.Root>Commodity Type <Label.Asterisk /></Label.Root>
                <Select.Root size="small" value={typeId} onValueChange={setTypeId}>
                  <Select.Trigger><Select.Value placeholder="Select type" /></Select.Trigger>
                  <Select.Content>
                    {types.map((t) => <Select.Item key={t.id} value={t.id}>{t.name}</Select.Item>)}
                  </Select.Content>
                </Select.Root>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>Commodity Name <Label.Asterisk /></Label.Root>
                <Input.Root size="small">
                  <Input.Wrapper>
                    <Input.Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter commodity name" required autoFocus />
                  </Input.Wrapper>
                </Input.Root>
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
                {pending ? 'Saving...' : 'Save Commodity'}
              </Button.Root>
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
