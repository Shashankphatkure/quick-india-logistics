import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import PageHeader from '@/components/page-header';
import { RiArrowLeftLine, RiToolsLine, type RemixiconComponentType } from '@remixicon/react';

export default function ComingSoon({
  icon = RiToolsLine,
  title,
  subtitle,
  breadcrumbs,
  description,
}: {
  icon?: RemixiconComponentType;
  title: string;
  subtitle: string;
  breadcrumbs: { label: string; href?: string }[];
  description?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader icon={icon} title={title} subtitle={subtitle} breadcrumbs={breadcrumbs}>
        <Button.Root variant="neutral" mode="stroke" size="small" asChild>
          <Link href="/dashboard" className="no-underline">
            <Button.Icon as={RiArrowLeftLine} />Back to Dashboard
          </Link>
        </Button.Root>
      </PageHeader>

      <div className="rounded-2xl border border-dashed border-stroke-soft-200 bg-bg-white-0 p-10 text-center shadow-regular-xs">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-bg-weak-50 text-text-sub-600">
          <RiToolsLine size={28} />
        </div>
        <h3 className="text-label-md font-semibold text-text-strong-950">Coming soon</h3>
        <p className="mx-auto mt-2 max-w-md text-paragraph-sm text-text-sub-600">
          {description ?? 'This module is on the roadmap but not yet active. Contact admin if you need it prioritized.'}
        </p>
      </div>
    </div>
  );
}
