'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import { RiAddLine } from '@remixicon/react';
import { addDesignationAction } from '../departments/actions';

export default function QuickAddDesignation() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await addDesignationAction(fd);
      if (r.ok) { toast.success('Designation added'); setName(''); setOpen(false); }
      else toast.error(r.error);
    });
  }

  return (
    <>
      <Button.Root size="small" onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />Add Designation
      </Button.Root>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-sm">
          <Modal.Header title="Add Designation" description="Create a new job title" />
          <form onSubmit={onSubmit}>
            <Modal.Body className="space-y-3 p-5">
              <div className="flex flex-col gap-1.5">
                <Label.Root>Designation Name <Label.Asterisk /></Label.Root>
                <Input.Root size="medium">
                  <Input.Wrapper><Input.Input name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Senior Manager" required autoFocus /></Input.Wrapper>
                </Input.Root>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
              <Button.Root size="small" type="submit" disabled={pending}>{pending ? 'Adding...' : 'Add Designation'}</Button.Root>
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
