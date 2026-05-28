import React from 'react';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiAddLine, RiMoneyRupeeCircleLine } from '@remixicon/react';

type ChargeCode = {
  code: string;
  label: string;
  description: string;
  type: 'percent' | 'flat' | 'per_kg' | 'per_box';
  default_value: number;
  applies_to: string;
};

const DEFAULT_CHARGES: ChargeCode[] = [
  { code: 'FUEL_SUR', label: 'Fuel Surcharge', description: 'Variable surcharge based on diesel price index', type: 'percent', default_value: 18, applies_to: 'All freight' },
  { code: 'HANDLING', label: 'Handling Charge', description: 'Per-shipment handling at origin/destination', type: 'flat', default_value: 50, applies_to: 'Surface & Air' },
  { code: 'COD_FEE', label: 'Cash on Delivery', description: 'COD collection fee — 2% of invoice value, min ₹100', type: 'percent', default_value: 2, applies_to: 'COD shipments' },
  { code: 'COLD_SUR', label: 'Cold Chain Surcharge', description: 'Premium for temperature-controlled handling', type: 'per_kg', default_value: 8, applies_to: 'Cold chain' },
  { code: 'DOCK_CHRG', label: 'Docket Charges', description: 'Documentation and processing fee', type: 'flat', default_value: 30, applies_to: 'All orders' },
  { code: 'INSURANCE', label: 'Transit Insurance', description: '0.1% of declared invoice value', type: 'percent', default_value: 0.1, applies_to: 'High-value shipments' },
  { code: 'ODA_DEL', label: 'ODA Delivery', description: 'Out-of-delivery-area surcharge', type: 'flat', default_value: 250, applies_to: 'ODA pincodes' },
  { code: 'WT_REC', label: 'Weight Reconciliation', description: 'Difference charge when chargeable > actual at coloader', type: 'per_kg', default_value: 12, applies_to: 'Air shipments' },
];

const TYPE_LABEL: Record<string, string> = { percent: '%', flat: '₹ flat', per_kg: '₹/kg', per_box: '₹/box' };

export default function ChargesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiMoneyRupeeCircleLine}
        iconColor="bg-warning-lighter text-warning-base"
        title="Charges"
        subtitle="Tariff and surcharge master — codes applied during invoicing"
        breadcrumbs={[{ label: 'Master' }, { label: 'Charges' }]}
      >
        <Button.Root size="small">
          <Button.Icon as={RiAddLine} />Add Charge
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Charge Codes', value: DEFAULT_CHARGES.length, trend: 0, trendLabel: 'configured' },
        { label: 'Percent-based', value: DEFAULT_CHARGES.filter(c => c.type === 'percent').length, trend: 0, trendLabel: 'all time' },
        { label: 'Flat-rate', value: DEFAULT_CHARGES.filter(c => c.type === 'flat').length, trend: 0, trendLabel: 'all time' },
        { label: 'Weight-based', value: DEFAULT_CHARGES.filter(c => c.type === 'per_kg' || c.type === 'per_box').length, trend: 0, trendLabel: 'all time' },
      ]} />

      <div className="rounded-xl border border-information-light bg-information-lighter p-4 text-paragraph-sm text-information-dark">
        <p className="font-medium">Default charge codes shown below.</p>
        <p className="text-paragraph-xs text-information-base mt-1">
          Per-client overrides can be configured per Bill-To. The codes here are the org-wide defaults applied during invoice generation.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>{['Code', 'Charge', 'Description', 'Type', 'Default Value', 'Applies To'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {DEFAULT_CHARGES.map(c => (
              <Table.Row key={c.code}>
                <Table.Cell className="h-auto py-3"><span className="text-paragraph-xs font-mono text-text-strong-950">{c.code}</span></Table.Cell>
                <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-text-strong-950">{c.label}</span></Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{c.description}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="small" variant="lighter" color={c.type === 'percent' ? 'blue' : c.type === 'flat' ? 'green' : 'purple'}>
                    {TYPE_LABEL[c.type]}
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">
                  {c.type === 'percent' ? `${c.default_value}%` : `₹${c.default_value}${c.type === 'per_kg' ? '/kg' : c.type === 'per_box' ? '/box' : ''}`}
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{c.applies_to}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
