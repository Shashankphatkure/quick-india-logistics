import React from 'react';
import { cn } from '@/utils/cn';

export type StatTone =
  | 'neutral'
  | 'muted'
  | 'success'
  | 'warning'
  | 'error'
  | 'verified'
  | 'info';

const TONE: Record<StatTone, { value: string; dot: string }> = {
  neutral: { value: 'text-text-strong-950', dot: 'bg-text-sub-600' },
  muted: { value: 'text-text-soft-400', dot: 'bg-text-soft-400' },
  success: { value: 'text-success-base', dot: 'bg-success-base' },
  warning: { value: 'text-warning-base', dot: 'bg-warning-base' },
  error: { value: 'text-error-base', dot: 'bg-error-base' },
  verified: { value: 'text-verified-base', dot: 'bg-verified-base' },
  info: { value: 'text-information-base', dot: 'bg-information-base' },
};

export interface StatTileProps {
  label: string;
  value: string | number;
  tone?: StatTone;
}

export default function StatTile({ label, value, tone = 'neutral' }: StatTileProps) {
  const t = TONE[tone];

  return (
    <div className="group rounded-xl bg-bg-weak-50 p-3 transition duration-200 ease-out hover:bg-bg-white-0 hover:shadow-regular-xs hover:ring-1 hover:ring-inset hover:ring-stroke-soft-200">
      <div className="flex items-center gap-1.5">
        <span className={cn('size-1.5 shrink-0 rounded-full', t.dot)} />
        <p className="truncate text-subheading-2xs uppercase tracking-wide text-text-sub-600">
          {label}
        </p>
      </div>
      <p className={cn('mt-2 text-title-h5 font-bold tabular-nums', t.value)}>{value}</p>
    </div>
  );
}
