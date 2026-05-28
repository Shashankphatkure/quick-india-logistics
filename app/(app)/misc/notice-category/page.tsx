import React from 'react';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiAddLine, RiNotification3Line } from '@remixicon/react';

const CATEGORIES = [
  { name: 'Holiday Schedule', description: 'Public holidays and branch closures', target: 'All staff', count: 8, color: 'blue' as const },
  { name: 'Policy Update', description: 'Updates to company policies and procedures', target: 'All staff', count: 4, color: 'purple' as const },
  { name: 'Maintenance Window', description: 'Scheduled system downtime', target: 'IT + Ops', count: 2, color: 'orange' as const },
  { name: 'Cold Chain Alert', description: 'Temperature excursion or asset failure', target: 'Cold-chain ops', count: 0, color: 'red' as const },
  { name: 'Branch Operations', description: 'Branch-level operational changes', target: 'Branch staff', count: 12, color: 'green' as const },
  { name: 'General', description: 'Catch-all for uncategorized notices', target: 'All staff', count: 3, color: 'gray' as const },
];

export default function NoticeCategoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiNotification3Line}
        iconColor="bg-feature-lighter text-feature-base"
        title="Notice Category"
        subtitle="Categories used to classify system-wide notices and alerts"
        breadcrumbs={[{ label: 'Miscellaneous' }, { label: 'Notice Category' }]}
      >
        <Button.Root size="small">
          <Button.Icon as={RiAddLine} />Add Category
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Categories', value: CATEGORIES.length, trend: 0, trendLabel: 'configured' },
        { label: 'Total Notices', value: CATEGORIES.reduce((s, c) => s + c.count, 0), trend: 0, trendLabel: 'all time' },
        { label: 'Active Alerts', value: CATEGORIES.filter(c => c.count > 0).length, trend: 0, trendLabel: 'in use' },
        { label: 'High-Priority', value: CATEGORIES.filter(c => c.color === 'red' || c.color === 'orange').length, trend: 0, trendLabel: 'critical' },
      ]} />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>{['Category', 'Description', 'Target Audience', 'Active Notices'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {CATEGORIES.map(c => (
              <Table.Row key={c.name}>
                <Table.Cell className="h-auto py-3">
                  <div className="flex items-center gap-2">
                    <Badge.Root size="small" variant="lighter" color={c.color}><Badge.Dot />{c.name}</Badge.Root>
                  </div>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{c.description}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{c.target}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{c.count}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
