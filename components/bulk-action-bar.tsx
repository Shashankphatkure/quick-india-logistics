'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import { RiToggleLine, RiCloseLine } from '@remixicon/react';

export type BulkAction = {
  label: string;
  icon?: React.ElementType;
  action: (ids: string[]) => Promise<{ ok: true } | { ok: false; error: string }>;
  successMsg: string;
  confirmMsg?: string;
};

export default function BulkActionBar({
  selected,
  onClear,
  actions,
}: {
  selected: string[];
  onClear: () => void;
  actions: BulkAction[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (selected.length === 0) return null;

  function run(a: BulkAction) {
    if (a.confirmMsg && !confirm(a.confirmMsg.replace('{n}', String(selected.length)))) return;
    startTransition(async () => {
      const r = await a.action(selected);
      if (r.ok) {
        toast.success(a.successMsg.replace('{n}', String(selected.length)));
        onClear();
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-information-light bg-information-lighter px-4 py-2.5 mb-3">
      <div className="flex items-center gap-3">
        <span className="text-paragraph-sm font-medium text-information-dark">
          {selected.length} selected
        </span>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md p-1 text-information-base hover:bg-information-light"
          aria-label="Clear selection"
        >
          <RiCloseLine size={14} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        {actions.map((a) => (
          <Button.Root key={a.label} size="xsmall" variant="neutral" mode="stroke" type="button" onClick={() => run(a)} disabled={pending}>
            {a.icon ? <Button.Icon as={a.icon} /> : <Button.Icon as={RiToggleLine} />}
            {a.label}
          </Button.Root>
        ))}
      </div>
    </div>
  );
}
