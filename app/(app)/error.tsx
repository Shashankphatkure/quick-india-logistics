'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import { RiErrorWarningLine, RiRefreshLine, RiArrowLeftLine } from '@remixicon/react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the server logs / monitoring
    console.error('App route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-error-lighter text-error-base">
        <RiErrorWarningLine size={28} />
      </div>
      <div>
        <h2 className="text-label-md font-semibold text-text-strong-950">Something went wrong</h2>
        <p className="mx-auto mt-2 max-w-md text-paragraph-sm text-text-sub-600">
          We hit an error loading this page. Try again, or head back to the dashboard.
        </p>
        {error.digest && (
          <p className="mt-1 text-paragraph-xs text-text-disabled-300 font-mono">Ref: {error.digest}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button.Root variant="neutral" mode="stroke" size="small" onClick={() => reset()}>
          <Button.Icon as={RiRefreshLine} />Try again
        </Button.Root>
        <Button.Root size="small" asChild>
          <Link href="/dashboard" className="no-underline">
            <Button.Icon as={RiArrowLeftLine} />Dashboard
          </Link>
        </Button.Root>
      </div>
    </div>
  );
}
