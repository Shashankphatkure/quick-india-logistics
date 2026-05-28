import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { many } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

type Row = {
  docket_no: string;
  booking_date: string;
  bill_to_name: string | null;
  client_name: string | null;
  shipper_name: string;
  consignee_name: string;
  origin: string;
  destination: string;
  mode: string;
  delivery_type: string;
  is_cold_chain: boolean;
  status: string;
  actual_weight_kg: string | null;
  chargeable_weight_kg: string | null;
  no_of_pieces: number;
  invoice_value: string | null;
  ewaybill_no: string | null;
};

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orgId = await currentOrgId();
  const sp = req.nextUrl.searchParams;
  const search = sp.get('search')?.trim() || null;

  const rows = await many<Row>(
    `select o.docket_no,
            to_char(o.booking_date, 'DD-MM-YYYY') as booking_date,
            bt.name as bill_to_name, c.name as client_name,
            o.shipper_name, o.consignee_name, o.origin, o.destination,
            o.mode, o.delivery_type, o.is_cold_chain, o.status,
            o.actual_weight_kg::text, o.chargeable_weight_kg::text,
            o.no_of_pieces,
            o.invoice_value::text, o.ewaybill_no
     from orders o
     left join bill_to bt on bt.id = o.bill_to_id
     left join clients c on c.id = o.client_id
     where o.org_id = $1
       and ($2::text is null or o.docket_no ilike '%' || $2 || '%' or o.shipper_name ilike '%' || $2 || '%' or o.consignee_name ilike '%' || $2 || '%')
     order by o.booking_date desc, o.created_at desc
     limit 10000`,
    [orgId, search],
  );

  const headers = [
    'Docket No', 'Booking Date', 'Bill To', 'Client', 'Shipper', 'Consignee',
    'Origin', 'Destination', 'Mode', 'Delivery Type', 'Cold Chain', 'Status',
    'Actual Weight (kg)', 'Chargeable Weight (kg)', 'Pieces', 'Invoice Value (INR)', 'EwayBill No',
  ];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      r.docket_no, r.booking_date, r.bill_to_name, r.client_name, r.shipper_name, r.consignee_name,
      r.origin, r.destination, r.mode, r.delivery_type, r.is_cold_chain ? 'Yes' : 'No', r.status,
      r.actual_weight_kg, r.chargeable_weight_kg, r.no_of_pieces, r.invoice_value, r.ewaybill_no,
    ].map(csvCell).join(','));
  }
  const csv = lines.join('\n');
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="orders-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
