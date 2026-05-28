import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import PageHeader from '@/components/page-header';
import { RiCalendarCheckLine } from '@remixicon/react';
import { many } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import AddOrderForm, { type AddOrderSelects } from './add-order-form';

export default async function AddOrderPage() {
  const orgId = await currentOrgId();

  const [billTos, clients, branches] = await Promise.all([
    many<{ id: string; name: string }>(
      `select id, name from bill_to where org_id = $1 and is_active order by name`,
      [orgId],
    ),
    many<{ id: string; name: string; bill_to_id: string }>(
      `select c.id, c.name, c.bill_to_id
       from clients c join bill_to bt on bt.id = c.bill_to_id
       where bt.org_id = $1 and c.is_active order by c.name`,
      [orgId],
    ),
    many<{ id: string; name: string }>(
      `select id, name from branches where org_id = $1 and is_active order by name`,
      [orgId],
    ),
  ]);

  const selects: AddOrderSelects = { billTos, clients, branches };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiCalendarCheckLine}
        title="Add Order"
        subtitle="Create a new shipment booking"
        breadcrumbs={[
          { label: 'Booking', href: '/booking/orders' },
          { label: 'Orders', href: '/booking/orders' },
          { label: 'Add Order' },
        ]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small" asChild>
          <Link href="/booking/orders" className="no-underline">Cancel</Link>
        </Button.Root>
      </PageHeader>

      <AddOrderForm selects={selects} />
    </div>
  );
}
