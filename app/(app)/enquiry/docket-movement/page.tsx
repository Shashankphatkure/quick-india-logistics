import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import { RiCompass3Line, RiSearchLine, RiArrowRightLine } from '@remixicon/react';
import { cn } from '@/utils/cn';
import { one, many } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { orderStatusLabel } from '@/lib/order-status';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';

type OrderHit = {
  id: string;
  docket_no: string;
  booking_date: string;
  shipper_name: string;
  consignee_name: string;
  origin: string;
  destination: string;
  status: string;
  client_name: string | null;
};
type Event = {
  id: string;
  status: string;
  note: string | null;
  vehicle_no: string | null;
  performed_by_name: string | null;
  performed_at: string;
};

export default async function DocketMovementPage({ searchParams }: { searchParams?: { docket?: string } }) {
  const orgId = await currentOrgId();
  const docket = searchParams?.docket?.trim() ?? '';

  let order: OrderHit | null = null;
  let events: Event[] = [];

  if (docket) {
    order = await one<OrderHit>(
      `select o.id, o.docket_no,
              to_char(o.booking_date, 'DD-MM-YYYY') as booking_date,
              o.shipper_name, o.consignee_name, o.origin, o.destination, o.status,
              c.name as client_name
       from orders o left join clients c on c.id = o.client_id
       where o.org_id = $1 and o.docket_no = $2`,
      [orgId, docket],
    );
    if (order) {
      events = await many<Event>(
        `select se.id, se.status, se.note, se.vehicle_no,
                u.full_name as performed_by_name,
                to_char(se.performed_at, 'DD-MM-YYYY HH24:MI') as performed_at
         from order_status_events se
         left join users u on u.id = se.performed_by
         where se.order_id = $1
         order by se.performed_at desc`,
        [order.id],
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiCompass3Line}
        iconColor="bg-feature-lighter text-feature-base"
        title="Docket Movement Enquiry"
        subtitle="Look up any docket and see its full status timeline"
        breadcrumbs={[{ label: 'Enquiry' }, { label: 'Docket Movement' }]}
      />

      <form method="GET" className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-paragraph-xs text-text-sub-600">Docket Number</label>
            <Input.Root size="medium">
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.Input name="docket" defaultValue={docket} placeholder="e.g. 738396 or D1234567" autoFocus />
              </Input.Wrapper>
            </Input.Root>
          </div>
          <Button.Root size="medium" type="submit">Track</Button.Root>
        </div>
      </form>

      {docket && !order && (
        <div className="rounded-2xl border border-error-light bg-error-lighter p-5 text-paragraph-sm text-error-dark">
          No docket found with number <span className="font-mono font-semibold">{docket}</span>.
        </div>
      )}

      {order && (
        <>
          <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-subheading-2xs uppercase tracking-wider text-text-sub-600">Docket</p>
                <h2 className="text-title-h6 text-text-strong-950 font-bold">{order.docket_no}</h2>
              </div>
              <Badge.Root size="medium" variant="light" color={(STATUS_TO_BADGE_COLOR[orderStatusLabel(order.status)] ?? 'gray') as BadgeColor}>
                <Badge.Dot />{orderStatusLabel(order.status)}
              </Badge.Root>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Booked', value: order.booking_date },
                { label: 'Client', value: order.client_name ?? '—' },
                { label: 'Shipper', value: order.shipper_name },
                { label: 'Consignee', value: order.consignee_name },
              ].map((r) => (
                <div key={r.label} className="flex flex-col">
                  <span className="text-paragraph-xs text-text-sub-600">{r.label}</span>
                  <span className="text-paragraph-sm font-medium text-text-strong-950">{r.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-bg-weak-50 p-4">
              <div className="flex-1 text-center">
                <p className="text-paragraph-xs text-text-sub-600">Origin</p>
                <p className="text-label-sm font-semibold text-text-strong-950 mt-0.5">{order.origin}</p>
              </div>
              <RiArrowRightLine size={18} className="shrink-0 text-text-disabled-300" />
              <div className="flex-1 text-center">
                <p className="text-paragraph-xs text-text-sub-600">Destination</p>
                <p className="text-label-sm font-semibold text-text-strong-950 mt-0.5">{order.destination}</p>
              </div>
            </div>

            <Link href={`/booking/orders/${order.docket_no}`} className="mt-3 inline-block text-paragraph-sm text-primary-base hover:underline no-underline">
              Open full order detail →
            </Link>
          </div>

          <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs">
            <p className="text-subheading-2xs uppercase tracking-wider text-text-sub-600 mb-4">Status Timeline</p>
            {events.length === 0 ? (
              <p className="text-paragraph-sm text-text-sub-600">No status events recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {events.map((e, i) => (
                  <div key={e.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full',
                        i === 0 ? 'bg-primary-base' : 'bg-success-lighter border border-success-light',
                      )}>
                        <div className={cn('size-1.5 rounded-full', i === 0 ? 'bg-static-white' : 'bg-success-base')} />
                      </div>
                      {i < events.length - 1 && <div className="mt-1 flex-1 w-px bg-stroke-soft-200" />}
                    </div>
                    <div className="pb-3 min-w-0 flex-1">
                      <p className="text-paragraph-sm font-medium text-text-strong-950 leading-tight">{orderStatusLabel(e.status)}</p>
                      <p className="text-paragraph-xs text-text-sub-600 mt-0.5">
                        {e.performed_at}{e.performed_by_name ? ` · ${e.performed_by_name}` : ''}{e.vehicle_no ? ` · ${e.vehicle_no}` : ''}
                      </p>
                      {e.note && <p className="text-paragraph-xs text-text-disabled-300 mt-0.5">{e.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
