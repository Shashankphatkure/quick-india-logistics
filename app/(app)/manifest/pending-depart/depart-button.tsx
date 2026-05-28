'use client';

import React, { useTransition } from 'react';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import { markManifestDepartedAction } from './actions';

export default function DepartButton({ manifestId }: { manifestId: string }) {
  const [pending, startTransition] = useTransition();
  function onClick() {
    const fd = new FormData();
    fd.set('manifestId', manifestId);
    startTransition(async () => {
      const r = await markManifestDepartedAction(fd);
      if (r.ok) toast.success('Manifest marked departed');
      else toast.error(r.error);
    });
  }
  return (
    <Button.Root size="xsmall" type="button" onClick={onClick} disabled={pending}>
      {pending ? '...' : 'Mark Departed'}
    </Button.Root>
  );
}
