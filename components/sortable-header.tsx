'use client';

import React, { useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { RiArrowUpSLine, RiArrowDownSLine, RiArrowUpDownLine } from '@remixicon/react';
import { cn } from '@/utils/cn';

/**
 * Clickable table-header cell that drives `?sort=<column>&dir=asc|desc` in the URL.
 * The parent server page re-fetches with the new ordering. Clicking the active
 * column flips direction; clicking a new column starts at desc.
 */
export default function SortableHeader({
  column,
  children,
  align = 'left',
}: {
  column: string;
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const activeSort = sp.get('sort');
  const activeDir = sp.get('dir') === 'asc' ? 'asc' : 'desc';
  const isActive = activeSort === column;

  function toggle() {
    const params = new URLSearchParams(sp.toString());
    const nextDir = isActive && activeDir === 'desc' ? 'asc' : 'desc';
    params.set('sort', column);
    params.set('dir', nextDir);
    params.delete('page');
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={cn(
        'flex items-center gap-1 select-none transition-colors hover:text-text-strong-950',
        align === 'right' && 'ml-auto flex-row-reverse',
        isActive ? 'text-text-strong-950' : 'text-text-sub-600',
      )}
    >
      {children}
      {isActive ? (
        activeDir === 'asc' ? (
          <RiArrowUpSLine size={13} className="text-primary-base" />
        ) : (
          <RiArrowDownSLine size={13} className="text-primary-base" />
        )
      ) : (
        <RiArrowUpDownLine size={11} className="text-text-disabled-300" />
      )}
    </button>
  );
}
