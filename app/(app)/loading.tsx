import React from 'react';

function Shimmer({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-weak-50 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shimmer className="size-10 rounded-xl" />
          <div className="space-y-2">
            <Shimmer className="h-5 w-48" />
            <Shimmer className="h-3 w-64" />
          </div>
        </div>
        <Shimmer className="h-8 w-24" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} className="h-24" />
        ))}
      </div>
      {/* Table */}
      <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs">
        <Shimmer className="mb-4 h-8 w-64" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Shimmer key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
