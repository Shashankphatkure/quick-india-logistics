import React from 'react';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiBuilding2Line } from '@remixicon/react';
import { many, one } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import OrganizationForm, { type OrgRow } from './organization-form';

type BranchSummary = {
  id: string;
  code: string;
  name: string;
  branch_type: string;
  city: string | null;
  state: string | null;
  is_active: boolean;
};

export default async function OrganizationPage() {
  const orgId = await currentOrgId();
  const org = await one<OrgRow>(`select id, name, legal_name, pan, tan, is_active from organizations where id = $1`, [orgId]);
  const branches = await many<BranchSummary>(
    `select id, code, name, branch_type, city, state, is_active
     from branches where org_id=$1 order by name limit 10`,
    [orgId],
  );
  const userCount = await one<{ n: string }>(`select count(*)::text as n from users where org_id=$1`, [orgId]);
  const branchCount = await one<{ n: string }>(`select count(*)::text as n from branches where org_id=$1`, [orgId]);

  if (!org) return <p>Organization not found</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiBuilding2Line}
        iconColor="bg-feature-lighter text-feature-base"
        title="Organization"
        subtitle="Manage organization profile and view branches"
        breadcrumbs={[{ label: 'Organization' }]}
      />

      <StatsStrip stats={[
        { label: 'Organization Name', value: org.name, trend: 0, trendLabel: '' },
        { label: 'Branches', value: Number(branchCount?.n ?? 0), trend: 0, trendLabel: 'total' },
        { label: 'Users', value: Number(userCount?.n ?? 0), trend: 0, trendLabel: 'total' },
        { label: 'Status', value: org.is_active ? 'Active' : 'Inactive', trend: 0, trendLabel: '' },
      ]} />

      <div>
        <h3 className="text-label-sm text-text-strong-950 mb-3">Profile</h3>
        <OrganizationForm org={org} />
      </div>

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 px-4 py-3 flex items-center justify-between">
          <h3 className="text-label-sm text-text-strong-950">Branches (first 10)</h3>
          <a href="/master/branches" className="text-paragraph-sm text-primary-base hover:underline no-underline">View all →</a>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>{['Code', 'Name', 'Type', 'Location', 'Status'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {branches.map(b => (
              <Table.Row key={b.id}>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{b.code}</Table.Cell>
                <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-primary-base">{b.name}</span></Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600 capitalize">{b.branch_type}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{[b.city, b.state].filter(Boolean).join(', ') || '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="medium" variant="light" color={b.is_active ? 'green' : 'gray'}>
                    <Badge.Dot />{b.is_active ? 'Active' : 'Inactive'}
                  </Badge.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
