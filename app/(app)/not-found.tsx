import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import { RiCompassLine, RiArrowLeftLine } from '@remixicon/react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-bg-weak-50 text-text-sub-600">
        <RiCompassLine size={28} />
      </div>
      <div>
        <h2 className="text-title-h5 font-bold text-text-strong-950">404</h2>
        <p className="mx-auto mt-1 max-w-md text-paragraph-sm text-text-sub-600">
          We couldn&apos;t find that page or record. It may have been moved or deleted.
        </p>
      </div>
      <Button.Root size="small" asChild>
        <Link href="/dashboard" className="no-underline">
          <Button.Icon as={RiArrowLeftLine} />Back to Dashboard
        </Link>
      </Button.Root>
    </div>
  );
}
