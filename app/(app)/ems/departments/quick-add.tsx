'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import { RiAddLine } from '@remixicon/react';
import { addDepartmentAction, addDesignationAction } from './actions';

export default function QuickAdd({ kind }: { kind: 'department' | 'designation' }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [pending, startTransition] = useTransition();
  const label = kind === 'department' ? 'Department' : 'Designation';

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = kind === 'department' ? await addDepartmentAction(fd) : await addDesignationAction(fd);
      if (r.ok) { toast.success(`${label} added`); setName(''); setOpen(false); }
      else toast.error(r.error);
    });
  }

  return (
    <>
      <Button.Root size="small" onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />Add {label}
      </Button.Root>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-sm">
          <Modal.Header title={`Add ${label}`} description={`Create a new ${label.toLowerCase()}`} />
          <form onSubmit={onSubmit}>
            <Modal.Body className="space-y-3 p-5">
              <div className="flex flex-col gap-1.5">
                <Label.Root>{label} Name <Label.Asterisk /></Label.Root>
                <Input.Root size="medium">
                  <Input.Wrapper><Input.Input name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={`Enter ${label.toLowerCase()} name`} required autoFocus /></Input.Wrapper>
                </Input.Root>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
              <Button.Root size="small" type="submit" disabled={pending}>{pending ? 'Adding...' : `Add ${label}`}</Button.Root>
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
