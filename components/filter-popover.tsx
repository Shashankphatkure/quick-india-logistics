'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import * as Popover from '@/components/ui/popover';
import * as Button from '@/components/ui/button';
import * as Label from '@/components/ui/label';
import * as Input from '@/components/ui/input';
import { RiFilterLine, RiCloseLine } from '@remixicon/react';

export type FilterField =
  | {
      name: string;
      label: string;
      type: 'select';
      options: { value: string; label: string }[];
    }
  | {
      name: string;
      label: string;
      type: 'text';
      placeholder?: string;
    }
  | {
      name: string;
      label: string;
      type: 'date';
    };

export default function FilterPopover({ fields }: { fields: FilterField[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const initial: Record<string, string> = {};
  for (const f of fields) initial[f.name] = sp.get(f.name) ?? '';
  const [values, setValues] = useState<Record<string, string>>(initial);

  function setValue(name: string, v: string) {
    setValues((s) => ({ ...s, [name]: v }));
  }

  function apply() {
    const params = new URLSearchParams(sp.toString());
    for (const f of fields) {
      const v = values[f.name];
      if (v) params.set(f.name, v);
      else params.delete(f.name);
    }
    params.delete('page'); // reset pagination
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
      setOpen(false);
    });
  }

  function clearAll() {
    const cleared: Record<string, string> = {};
    for (const f of fields) cleared[f.name] = '';
    setValues(cleared);
    const params = new URLSearchParams(sp.toString());
    for (const f of fields) params.delete(f.name);
    params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
      setOpen(false);
    });
  }

  const activeCount = fields.filter((f) => sp.get(f.name)).length;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button.Root variant="neutral" mode="stroke" size="small" type="button">
          <Button.Icon as={RiFilterLine} />
          Filter
          {activeCount > 0 && (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-base px-1 text-[10px] font-semibold text-static-white">
              {activeCount}
            </span>
          )}
        </Button.Root>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-72 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-label-sm text-text-strong-950">Filters</p>
          {activeCount > 0 && (
            <button type="button" onClick={clearAll} className="text-paragraph-xs text-primary-base hover:underline">
              Clear all
            </button>
          )}
        </div>

        {fields.map((f) => (
          <div key={f.name} className="flex flex-col gap-1.5">
            <Label.Root>{f.label}</Label.Root>
            {f.type === 'select' ? (
              <select
                value={values[f.name] ?? ''}
                onChange={(e) => setValue(f.name, e.target.value)}
                className="w-full rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-1.5 text-paragraph-sm text-text-strong-950 outline-none focus:border-stroke-strong-950"
              >
                <option value="">— Any —</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === 'date' ? (
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input
                    type="date"
                    value={values[f.name] ?? ''}
                    onChange={(e) => setValue(f.name, e.target.value)}
                  />
                </Input.Wrapper>
              </Input.Root>
            ) : (
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input
                    value={values[f.name] ?? ''}
                    onChange={(e) => setValue(f.name, e.target.value)}
                    placeholder={f.placeholder}
                  />
                </Input.Wrapper>
              </Input.Root>
            )}
          </div>
        ))}

        <div className="flex justify-end gap-2 pt-1">
          <Button.Root variant="neutral" mode="stroke" size="xsmall" type="button" onClick={() => setOpen(false)}>
            <Button.Icon as={RiCloseLine} />Cancel
          </Button.Root>
          <Button.Root size="xsmall" type="button" onClick={apply} disabled={pending}>
            {pending ? 'Applying...' : 'Apply'}
          </Button.Root>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
