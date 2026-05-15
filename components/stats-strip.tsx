import React from 'react';
import { cn } from '@/utils/cn';
import { RiArrowUpLine, RiArrowDownLine } from '@remixicon/react';

export interface Stat {
  label: string;
  value: string | number;
  trend?: number;      // positive = up, negative = down, undefined = no trend
  trendLabel?: string; // e.g. "vs last week", "this month"
  prefix?: string;     // e.g. "$"
  suffix?: string;     // e.g. "%"
}

interface StatsStripProps {
  stats: Stat[];
  className?: string;
  cols?: 2 | 3 | 4 | 5;
}

function StatCard({ stat }: { stat: Stat }) {
  const hasTrend = stat.trend !== undefined;
  const isPositive = (stat.trend ?? 0) >= 0;

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-5 py-4 shadow-regular-xs">
      <p className="text-paragraph-sm text-text-sub-600">{stat.label}</p>
      <div className="flex items-end gap-3">
        <p className="text-title-h5 font-bold text-text-strong-950">
          {stat.prefix && <span className="text-label-md">{stat.prefix}</span>}
          {stat.value}
          {stat.suffix && <span className="text-label-md">{stat.suffix}</span>}
        </p>
        {hasTrend && (
          <div className={cn(
            'mb-0.5 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
            isPositive
              ? 'bg-success-lighter text-success-dark'
              : 'bg-error-lighter text-error-dark',
          )}>
            {isPositive
              ? <RiArrowUpLine size={11} />
              : <RiArrowDownLine size={11} />}
            <span>{isPositive ? '+' : ''}{stat.trend}%</span>
            {stat.trendLabel && (
              <span className="font-normal text-text-sub-600 ml-0.5">{stat.trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const GRID_COLS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 lg:grid-cols-5',
};

export default function StatsStrip({ stats, className, cols }: StatsStripProps) {
  const colCount = cols ?? (stats.length as 2 | 3 | 4 | 5);
  return (
    <div className={cn('grid gap-3', GRID_COLS[colCount] ?? 'grid-cols-4', className)}>
      {stats.map(stat => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
