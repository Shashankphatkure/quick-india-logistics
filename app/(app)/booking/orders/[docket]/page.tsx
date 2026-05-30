import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as Button from '@/components/ui/button';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import {
  RiArrowLeftLine, RiCalendarCheckLine, RiArrowRightLine,
} from '@remixicon/react';
import { cn } from '@/utils/cn';
import { one, many } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { getSession } from '@/lib/auth';
import { orderStatusLabel, DELIVERY_TYPE_LABEL, lockStateLabel } from '@/lib/order-status';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';
import { listOrderImages } from '@/lib/db/order-images';
import { presignGet } from '@/lib/s3';
import ImageGallery, { type ImageItem } from './image-gallery';
import AssetAttach, { type AttachedAsset, type AssetOption } from './asset-attach';
import StatusControl from './status-control';
import LockStateControl from './lock-state-control';

type OrderDetail = {
  id: string;
  docket_no: string;
  booking_date: string;
  bill_to_name: string | null;
  client_name: string | null;
  shipper_name: string;
  shipper_phone: string | null;
  shipper_address: string | null;
  consignee_name: string;
  consignee_phone: string | null;
  consignee_address: string | null;
  origin: string;
  destination: string;
  origin_branch: string | null;
  destination_branch: string | null;
  mode: string;
  delivery_type: string;
  is_cold_chain: boolean;
  priority: string;
  status: string;
  lock_state: string;
  actual_weight_kg: string | null;
  chargeable_weight_kg: string | null;
  no_of_pieces: number;
  no_of_boxes: number;
  invoice_value: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  ewaybill_no: string | null;
  ewaybill_part_b_done: boolean;
  ewaybill_part_b_vehicle_no: string | null;
  ewaybill_part_b_transporter_name: string | null;
  ewaybill_part_b_filled_at: string | null;
  pod_recipient_name: string | null;
  pod_recipient_phone: string | null;
  delivered_at: string | null;
  current_branch: string | null;
  created_by_name: string | null;
  tat_hours: number | null;
  expected_delivery_date: string | null;
  eta_status: string | null;
};

type StatusEvent = {
  id: string;
  status: string;
  note: string | null;
  vehicle_no: string | null;
  performed_by_name: string | null;
  performed_at: string;
};

type Manifest = { id: string; manifest_no: string; state: string };
type Runsheet = { id: string; runsheet_no: string; state: string };
type LockEvent = {
  id: string;
  from_state: string;
  to_state: string;
  performed_by_name: string | null;
  performed_at: string;
  note: string | null;
};

type DimensionRow = {
  id: string;
  length_cm: string | null;
  breadth_cm: string | null;
  height_cm: string | null;
  no_of_pieces: number;
};

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  invoice_date: string | null;
  invoice_value: string | null;
  ewaybill_no: string | null;
};

export default async function OrderDetailPage({ params }: { params: { docket: string } }) {
  const orgId = await currentOrgId();
  const session = await getSession();
  const docketNo = decodeURIComponent(params.docket);

  const order = await one<OrderDetail>(
    `select o.id, o.docket_no,
            to_char(o.booking_date, 'DD-MM-YYYY') as booking_date,
            bt.name as bill_to_name, c.name as client_name,
            o.shipper_name, o.shipper_phone, o.shipper_address,
            o.consignee_name, o.consignee_phone, o.consignee_address,
            o.origin, o.destination,
            ob.name as origin_branch, db.name as destination_branch,
            o.mode, o.delivery_type, o.is_cold_chain, o.priority,
            o.status, o.lock_state,
            o.actual_weight_kg::text, o.chargeable_weight_kg::text,
            o.no_of_pieces, o.no_of_boxes,
            o.invoice_value::text, o.invoice_number,
            to_char(o.invoice_date, 'DD-MM-YYYY') as invoice_date,
            o.ewaybill_no, o.ewaybill_part_b_done,
            o.ewaybill_part_b_vehicle_no, o.ewaybill_part_b_transporter_name,
            to_char(o.ewaybill_part_b_filled_at, 'DD-MM-YYYY HH24:MI') as ewaybill_part_b_filled_at,
            o.pod_recipient_name, o.pod_recipient_phone,
            to_char(o.delivered_at, 'DD-MM-YYYY HH24:MI') as delivered_at,
            cb.name as current_branch,
            u.full_name as created_by_name,
            t.tat_hours,
            to_char(o.booking_date::timestamptz + make_interval(hours => t.tat_hours), 'DD-MM-YYYY HH24:MI') as expected_delivery_date,
            case
              when t.tat_hours is null then null
              when o.status = 'delivered' then
                case when o.delivered_at is not null and o.delivered_at <= o.booking_date::timestamptz + make_interval(hours => t.tat_hours)
                     then 'on_time' else 'late' end
              when o.status = 'cancelled' then 'cancelled'
              when now() > o.booking_date::timestamptz + make_interval(hours => t.tat_hours) then 'overdue'
              else 'on_track'
            end as eta_status
     from orders o
     left join bill_to bt on bt.id = o.bill_to_id
     left join clients c on c.id = o.client_id
     left join branches ob on ob.id = o.origin_branch_id
     left join branches db on db.id = o.destination_branch_id
     left join branches cb on cb.id = o.current_branch_id
     left join users u on u.id = o.created_by
     left join tat_routes t on t.client_id = o.client_id and t.mode = o.mode
       and t.origin_branch_id = o.origin_branch_id and t.destination_branch_id = o.destination_branch_id
     where o.org_id = $1 and o.docket_no = $2`,
    [orgId, docketNo],
  );

  if (!order) notFound();

  const [events, manifests, runsheets, imageRows, attachedAssets, availableAssets] = await Promise.all([
    many<StatusEvent>(
      `select se.id, se.status, se.note, se.vehicle_no,
              u.full_name as performed_by_name,
              to_char(se.performed_at, 'DD-MM-YYYY HH24:MI') as performed_at
       from order_status_events se
       left join users u on u.id = se.performed_by
       where se.order_id = $1 order by se.performed_at desc`,
      [order.id],
    ),
    many<Manifest>(
      `select m.id, m.manifest_no, m.state
       from manifest_orders mo join manifests m on m.id = mo.manifest_id
       where mo.order_id = $1`,
      [order.id],
    ),
    many<Runsheet>(
      `select r.id, r.runsheet_no, r.state
       from runsheet_orders ro join runsheets r on r.id = ro.runsheet_id
       where ro.order_id = $1`,
      [order.id],
    ),
    listOrderImages(order.id),
    many<AttachedAsset>(
      `select oa.id, oa.asset_id, oa.asset_kind, oa.asset_label,
              to_char(oa.attached_at, 'DD-MM-YYYY HH24:MI') as attached_at
       from order_assets oa where oa.order_id = $1 and oa.detached_at is null
       order by oa.attached_at desc`,
      [order.id],
    ),
    many<AssetOption>(
      `select id, asset_id, asset_kind, box_type, logger_type from assets
       where org_id = $1 and not in_use and not is_defective
       order by asset_id limit 50`,
      [orgId],
    ),
  ]);

  const lockEvents = await many<LockEvent>(
    `select le.id, le.from_state, le.to_state,
            u.full_name as performed_by_name,
            to_char(le.performed_at, 'DD-MM-YYYY HH24:MI') as performed_at,
            le.note
     from order_lock_events le
     left join users u on u.id = le.performed_by
     where le.order_id = $1 order by le.performed_at desc`,
    [order.id],
  );

  const [dimensions, invoices] = await Promise.all([
    many<DimensionRow>(
      `select id, length_cm::text, breadth_cm::text, height_cm::text, no_of_pieces
       from order_dimensions where order_id = $1 order by created_at`,
      [order.id],
    ),
    many<InvoiceRow>(
      `select id, invoice_number, to_char(invoice_date, 'DD-MM-YYYY') as invoice_date,
              invoice_value::text, ewaybill_no
       from order_invoices where order_id = $1 order by created_at`,
      [order.id],
    ),
  ]);

  const images: ImageItem[] = await Promise.all(
    imageRows.map(async (img) => ({
      id: img.id,
      kind: img.kind,
      caption: img.caption,
      uploaded_by_name: img.uploaded_by_name,
      uploaded_at: img.uploaded_at,
      presigned_url: await presignGet(img.s3_key, 3600),
    })),
  );

  const statusLabel = orderStatusLabel(order.status);
  const statusColor = (STATUS_TO_BADGE_COLOR[statusLabel] ?? 'gray') as BadgeColor;

  const ETA_META: Record<string, { label: string; color: BadgeColor }> = {
    on_time: { label: 'Delivered On Time', color: 'green' },
    late: { label: 'Delivered Late', color: 'red' },
    overdue: { label: 'Overdue', color: 'red' },
    on_track: { label: 'On Track', color: 'blue' },
    cancelled: { label: 'Cancelled', color: 'gray' },
  };
  const etaMeta = order.eta_status ? ETA_META[order.eta_status] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiCalendarCheckLine}
        title={`Order #${order.docket_no}`}
        subtitle={`Booked ${order.booking_date} · ${DELIVERY_TYPE_LABEL[order.delivery_type] ?? order.delivery_type}`}
        breadcrumbs={[
          { label: 'Booking', href: '/booking/orders' },
          { label: 'Orders', href: '/booking/orders' },
          { label: order.docket_no },
        ]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small" asChild>
          <Link href="/booking/orders" className="no-underline">
            <Button.Icon as={RiArrowLeftLine} />
            Back to list
          </Link>
        </Button.Root>
        <Badge.Root size="medium" variant="light" color={statusColor}>
          <Badge.Dot />{statusLabel}
        </Badge.Root>
        {order.is_cold_chain && <Badge.Root size="medium" variant="lighter" color="sky">Cold Chain</Badge.Root>}
        <Badge.Root size="small" variant="lighter" color="gray">Lock: {order.lock_state}</Badge.Root>
        <StatusControl
          orderId={order.id}
          docketNo={order.docket_no}
          currentStatus={order.status}
          consignee={order.consignee_name}
        />
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title="Route">
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-xl bg-bg-weak-50 px-3 py-3 text-center">
                <p className="text-paragraph-xs text-text-sub-600">Origin</p>
                <p className="text-label-sm font-semibold text-text-strong-950 mt-0.5">{order.origin}</p>
                <p className="text-paragraph-xs text-text-disabled-300 mt-0.5">{order.origin_branch ?? '—'}</p>
              </div>
              <RiArrowRightLine size={18} className="shrink-0 text-text-disabled-300" />
              <div className="flex-1 rounded-xl bg-bg-weak-50 px-3 py-3 text-center">
                <p className="text-paragraph-xs text-text-sub-600">Destination</p>
                <p className="text-label-sm font-semibold text-text-strong-950 mt-0.5">{order.destination}</p>
                <p className="text-paragraph-xs text-text-disabled-300 mt-0.5">{order.destination_branch ?? '—'}</p>
              </div>
            </div>
            <Row label="Mode" value={order.mode} />
            <Row label="Priority" value={order.priority} />
            <Row label="Current Branch" value={order.current_branch ?? '—'} />
          </Card>

          <Card title="Expected Delivery">
            {order.tat_hours == null ? (
              <p className="text-paragraph-sm text-text-sub-600">
                No TAT route configured for this client / mode / lane — ETA unavailable.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-paragraph-sm text-text-sub-600 shrink-0">Expected By</span>
                  <span className="flex items-center gap-2">
                    <span className="text-paragraph-sm font-medium text-text-strong-950">{order.expected_delivery_date}</span>
                    {etaMeta && <Badge.Root size="small" variant="light" color={etaMeta.color}><Badge.Dot />{etaMeta.label}</Badge.Root>}
                  </span>
                </div>
                <Row label="TAT" value={`${order.tat_hours} hrs`} />
                {order.delivered_at && <Row label="Delivered At" value={order.delivered_at} />}
              </>
            )}
          </Card>

          <Card title="Parties">
            <Row label="Bill To" value={order.bill_to_name ?? '—'} />
            <Row label="Client" value={order.client_name ?? '—'} />
          </Card>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Card title="Shipper">
              <Row label="Name" value={order.shipper_name} />
              <Row label="Phone" value={order.shipper_phone ?? '—'} />
              <Row label="Address" value={order.shipper_address ?? '—'} />
            </Card>
            <Card title="Consignee">
              <Row label="Name" value={order.consignee_name} />
              <Row label="Phone" value={order.consignee_phone ?? '—'} />
              <Row label="Address" value={order.consignee_address ?? '—'} />
            </Card>
          </div>

          <Card title="Cargo">
            <Row label="Actual Weight" value={order.actual_weight_kg ? `${order.actual_weight_kg} kg` : '—'} />
            <Row label="Chargeable Weight" value={order.chargeable_weight_kg ? `${order.chargeable_weight_kg} kg` : '—'} />
            <Row label="Pieces" value={order.no_of_pieces.toString()} />
            <Row label="Boxes" value={order.no_of_boxes.toString()} />
          </Card>

          {dimensions.length > 0 && (
            <Card title={`Package Dimensions (${dimensions.length})`}>
              <div className="space-y-1.5">
                {dimensions.map((d, i) => (
                  <div key={d.id} className="flex items-center justify-between text-paragraph-sm">
                    <span className="text-text-sub-600">Box {i + 1}</span>
                    <span className="font-medium text-text-strong-950">
                      {d.length_cm ?? '—'} × {d.breadth_cm ?? '—'} × {d.height_cm ?? '—'} cm
                      <span className="ml-2 text-text-sub-600">× {d.no_of_pieces} pcs</span>
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {invoices.length > 0 && (
            <Card title={`Invoices (${invoices.length})`}>
              <div className="space-y-2.5">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between border-b border-stroke-soft-200 pb-2 last:border-0 last:pb-0 text-paragraph-sm">
                    <span className="font-medium text-text-strong-950">{inv.invoice_number ?? '—'}</span>
                    <span className="text-text-sub-600">{inv.invoice_date ?? '—'}</span>
                    <span className="font-medium text-text-strong-950">{inv.invoice_value ? `₹${Number(inv.invoice_value).toLocaleString('en-IN')}` : '—'}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card title="Invoice & EwayBill">
            <Row label="Invoice Number" value={order.invoice_number ?? '—'} />
            <Row label="Invoice Date" value={order.invoice_date ?? '—'} />
            <Row label="Invoice Value" value={order.invoice_value ? `₹${Number(order.invoice_value).toLocaleString('en-IN')}` : '—'} />
            <Row label="EwayBill No" value={order.ewaybill_no ?? '—'} />
            <Row label="Part B Done" value={order.ewaybill_part_b_done ? 'Yes' : 'No'} />
            {order.ewaybill_part_b_done && (
              <>
                <Row label="Part B Vehicle" value={order.ewaybill_part_b_vehicle_no ?? '—'} />
                <Row label="Part B Transporter" value={order.ewaybill_part_b_transporter_name ?? '—'} />
                <Row label="Part B Filled" value={order.ewaybill_part_b_filled_at ?? '—'} />
              </>
            )}
          </Card>

          {order.status === 'delivered' && (
            <Card title="Proof of Delivery">
              <Row label="Recipient" value={order.pod_recipient_name ?? '—'} />
              <Row label="Phone" value={order.pod_recipient_phone ?? '—'} />
              <Row label="Delivered At" value={order.delivered_at ?? '—'} />
            </Card>
          )}

          {order.is_cold_chain && (
            <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-5 shadow-regular-xs">
              <AssetAttach orderId={order.id} attached={attachedAssets} available={availableAssets} />
            </div>
          )}

          <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-5 shadow-regular-xs">
            <ImageGallery orderId={order.id} images={images} />
          </div>
        </div>

        <div className="space-y-5">
          {manifests.length > 0 && (
            <Card title="Linked Manifests">
              {manifests.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-1.5">
                  <Link href={`/manifest/${m.manifest_no}`} className="text-paragraph-sm font-medium text-primary-base no-underline hover:underline">{m.manifest_no}</Link>
                  <Badge.Root size="small" variant="lighter" color="gray">{m.state}</Badge.Root>
                </div>
              ))}
            </Card>
          )}

          {runsheets.length > 0 && (
            <Card title="Linked Runsheets">
              {runsheets.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-1.5">
                  <Link href={`/runsheet/${r.runsheet_no}`} className="text-paragraph-sm font-medium text-primary-base no-underline hover:underline">{r.runsheet_no}</Link>
                  <Badge.Root size="small" variant="lighter" color="gray">{r.state}</Badge.Root>
                </div>
              ))}
            </Card>
          )}

          <Card title="Maker-Checker Lock">
            <LockStateControl
              orderId={order.id}
              currentLockState={order.lock_state}
              userType={session?.userType ?? 'employee'}
            />
            {lockEvents.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-stroke-soft-200 pt-3">
                {lockEvents.map((e) => (
                  <div key={e.id} className="text-paragraph-xs">
                    <p className="text-text-strong-950">
                      {lockStateLabel(e.from_state)} <span className="text-text-disabled-300">→</span> {lockStateLabel(e.to_state)}
                    </p>
                    <p className="text-text-sub-600">{e.performed_at}{e.performed_by_name ? ` · ${e.performed_by_name}` : ''}</p>
                    {e.note && <p className="text-text-disabled-300">{e.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Status Timeline">
            {events.length === 0 ? (
              <p className="text-paragraph-sm text-text-sub-600">No status events yet</p>
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
                        {e.performed_at}{e.performed_by_name ? ` · ${e.performed_by_name}` : ''}
                      </p>
                      {e.note && <p className="text-paragraph-xs text-text-disabled-300 mt-0.5">{e.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Audit">
            <Row label="Created By" value={order.created_by_name ?? '—'} />
            <Row label="Order ID" value={<span className="font-mono text-paragraph-xs">{order.id}</span>} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-5 shadow-regular-xs">
      <h3 className="text-subheading-2xs uppercase tracking-wider text-text-sub-600 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-paragraph-sm text-text-sub-600 shrink-0">{label}</span>
      <span className="text-paragraph-sm font-medium text-text-strong-950 text-right">{value}</span>
    </div>
  );
}
