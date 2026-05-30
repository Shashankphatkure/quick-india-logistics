import React from 'react';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiMoneyRupeeCircleLine } from '@remixicon/react';
import { listCharges, getChargeCounts } from '@/lib/db/charges';
import { currentOrgId } from '@/lib/tenant';
import AddChargeForm from './add-charge-form';
import ChargesTable from './charges-table';

export default async function ChargesPage() {
  const orgId = await currentOrgId();
  const [rows, counts] = await Promise.all([
    listCharges(orgId),
    getChargeCounts(orgId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiMoneyRupeeCircleLine}
        iconColor="bg-warning-lighter text-warning-base"
        title="Charges"
        subtitle="Tariff and surcharge master — codes applied during invoicing"
        breadcrumbs={[{ label: 'Master' }, { label: 'Charges' }]}
      >
        <AddChargeForm />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Charge Codes', value: counts.total, trend: 0, trendLabel: 'active' },
        { label: 'Percent-based', value: counts.percent, trend: 0, trendLabel: 'active' },
        { label: 'Flat-rate', value: counts.flat, trend: 0, trendLabel: 'active' },
        { label: 'Weight-based', value: counts.weight, trend: 0, trendLabel: 'active' },
      ]} />

      <div className="rounded-xl border border-information-light bg-information-lighter p-4 text-paragraph-sm text-information-dark">
        <p className="font-medium">Org-wide charge codes.</p>
        <p className="text-paragraph-xs text-information-base mt-1">
          Per-client overrides can be configured per Bill-To. The codes here are the org-wide defaults applied during invoice generation.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <ChargesTable rows={rows} />
      </div>
    </div>
  );
}
