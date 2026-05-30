'use server';

import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';
import { getClientDimensionConfig } from '@/lib/db/bill-to';
import { volumetricWeight, chargeableWeight, round3 } from '@/lib/utils/dimension-calc';

export type CreateOrderResult = { ok: true; docketNo: string } | { ok: false; error: string };

const MODES = new Set(['local', 'air', 'surface', 'cargo', 'train', 'courier', 'warehouse']);
const DELIVERY_TYPES = new Set(['local', 'domestic', 'international']);

type DimInput = { length?: string; breadth?: string; height?: string; pieces?: string };
type InvInput = { number?: string; date?: string; value?: string };

function parseRows<T>(raw: string): T[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

export async function createOrderAction(formData: FormData): Promise<CreateOrderResult> {
  const session = await requireSession();
  const orgId = await currentOrgId();

  const billToId = String(formData.get('billToId') ?? '').trim();
  const clientId = String(formData.get('clientId') ?? '').trim();
  const deliveryType = String(formData.get('deliveryType') ?? '').trim();
  const mode = String(formData.get('mode') ?? '').trim();
  const isColdChain = formData.get('isColdChain') === 'true';
  const priority = String(formData.get('priority') ?? 'normal').trim();
  const bookingDate = String(formData.get('bookingDate') ?? '').trim() || new Date().toISOString().slice(0, 10);

  const shipperName = String(formData.get('shipperName') ?? '').trim();
  const shipperPhone = String(formData.get('shipperPhone') ?? '').trim() || null;
  const shipperAddress = String(formData.get('shipperAddress') ?? '').trim() || null;
  const origin = String(formData.get('origin') ?? '').trim();
  const originBranchId = String(formData.get('originBranchId') ?? '').trim() || null;

  const consigneeName = String(formData.get('consigneeName') ?? '').trim();
  const consigneePhone = String(formData.get('consigneePhone') ?? '').trim() || null;
  const consigneeAddress = String(formData.get('consigneeAddress') ?? '').trim() || null;
  const destination = String(formData.get('destination') ?? '').trim();
  const destinationBranchId = String(formData.get('destinationBranchId') ?? '').trim() || null;

  const actualWeight = Number(formData.get('actualWeightKg') ?? 0);
  const noOfPieces = Number(formData.get('noOfPieces') ?? 0);
  const noOfBoxes = Number(formData.get('noOfBoxes') ?? 0);
  const localDeliveryType = String(formData.get('localDeliveryType') ?? '').trim() || null;
  const cod = formData.get('cod') === 'true';
  const remarks = String(formData.get('remarks') ?? '').trim() || null;
  const length = Number(formData.get('length') ?? 0) || null;
  const breadth = Number(formData.get('breadth') ?? 0) || null;
  const height = Number(formData.get('height') ?? 0) || null;

  const ewaybillNo = String(formData.get('ewaybillNo') ?? '').trim() || null;
  const invoiceNumber = String(formData.get('invoiceNumber') ?? '').trim() || null;
  const invoiceDate = String(formData.get('invoiceDate') ?? '').trim() || null;
  const invoiceValue = Number(formData.get('invoiceValue') ?? 0) || null;

  // Multi-row children. Keep only rows with real content.
  const dimRows = parseRows<DimInput>(String(formData.get('dimensionsJson') ?? ''))
    .map((d) => ({
      length: Number(d.length) || null,
      breadth: Number(d.breadth) || null,
      height: Number(d.height) || null,
      pieces: Number(d.pieces) || 1,
    }))
    .filter((d) => d.length || d.breadth || d.height);
  const invRows = parseRows<InvInput>(String(formData.get('invoicesJson') ?? ''))
    .map((v) => ({
      number: String(v.number ?? '').trim() || null,
      date: String(v.date ?? '').trim() || null,
      value: Number(v.value) || null,
    }))
    .filter((v) => v.number || v.date || v.value);

  // Validate
  if (!shipperName) return { ok: false, error: 'Shipper name is required' };
  if (!consigneeName) return { ok: false, error: 'Consignee name is required' };
  if (!origin) return { ok: false, error: 'Origin is required' };
  if (!destination) return { ok: false, error: 'Destination is required' };
  if (!MODES.has(mode)) return { ok: false, error: 'Invalid mode' };
  if (!DELIVERY_TYPES.has(deliveryType)) return { ok: false, error: 'Invalid delivery type' };
  if (actualWeight <= 0) return { ok: false, error: 'Actual weight must be > 0' };

  // Chargeable weight: volumetric (L×B×H / divisor × multiplier) vs actual, whichever
  // is greater — but only when the client bills by dimension weight (use_kg) and a
  // formula exists for this mode. Otherwise chargeable = actual.
  // Sum volumetric across every dimension row (× pieces) when the client bills
  // by dimension weight on this mode. Fall back to the legacy single L/B/H if
  // no multi-row data was sent.
  let dimensionWeight: number | null = null;
  let chargeable = round3(actualWeight);
  if (clientId) {
    const cfg = await getClientDimensionConfig(clientId, mode);
    if (cfg && cfg.use_dimension === 'use_kg' && cfg.divisor_x) {
      const divisor = cfg.divisor_x;
      const mult = cfg.multiplier_y ?? 1;
      const rowsForCalc = dimRows.length > 0
        ? dimRows
        : (length && breadth && height ? [{ length, breadth, height, pieces: 1 }] : []);
      const vol = rowsForCalc.reduce((sum, d) => {
        const l = d.length ?? 0, b = d.breadth ?? 0, h = d.height ?? 0;
        if (!l || !b || !h) return sum;
        return sum + volumetricWeight(l, b, h, divisor, mult) * (d.pieces ?? 1);
      }, 0);
      if (vol > 0) {
        dimensionWeight = round3(vol);
        chargeable = round3(chargeableWeight(actualWeight, vol));
      }
    }
  }

  // Auto-generate docket number from timestamp
  const docketNo = `D${Date.now().toString().slice(-9)}`;

  const client = await pool.connect();
  try {
    await client.query('begin');

    const ins = await client.query<{ id: string; docket_no: string }>(
      `insert into orders (
        org_id, docket_no, booking_date,
        bill_to_id, client_id,
        shipper_name, shipper_phone, shipper_address,
        consignee_name, consignee_phone, consignee_address,
        origin, destination, origin_branch_id, destination_branch_id,
        mode, delivery_type, is_cold_chain, priority,
        actual_weight_kg, dimension_weight_kg, chargeable_weight_kg,
        length_cm, breadth_cm, height_cm,
        no_of_pieces, no_of_boxes,
        invoice_value, invoice_number, invoice_date, ewaybill_no,
        local_delivery_type, cod, remarks,
        status, lock_state, created_branch_id, current_branch_id, created_by
      ) values (
        $1, $2, $3,
        $4, $5,
        $6, $7, $8,
        $9, $10, $11,
        $12, $13, $14, $15,
        $16, $17, $18, $19,
        $20, $21, $22,
        $23, $24, $25,
        $26, $27,
        $28, $29, $30, $31,
        $33, $34, $35,
        'received', 'data_entry', $14, $14, $32
      ) returning id, docket_no`,
      [
        orgId, docketNo, bookingDate,
        billToId || null, clientId || null,
        shipperName, shipperPhone, shipperAddress,
        consigneeName, consigneePhone, consigneeAddress,
        origin, destination, originBranchId, destinationBranchId,
        mode, deliveryType, isColdChain, priority,
        actualWeight, dimensionWeight, chargeable,
        length, breadth, height,
        noOfPieces, noOfBoxes,
        invoiceValue, invoiceNumber, invoiceDate, ewaybillNo,
        session.userId,
        localDeliveryType, cod, remarks,
      ],
    );

    const order = ins.rows[0];
    if (!order) throw new Error('Insert failed');

    // Multi-row dimension children
    for (const d of dimRows) {
      await client.query(
        `insert into order_dimensions (order_id, length_cm, breadth_cm, height_cm, no_of_pieces)
         values ($1, $2, $3, $4, $5)`,
        [order.id, d.length, d.breadth, d.height, d.pieces],
      );
    }

    // Multi-row invoice children
    for (const v of invRows) {
      await client.query(
        `insert into order_invoices (order_id, invoice_number, invoice_date, invoice_value, ewaybill_no)
         values ($1, $2, $3, $4, $5)`,
        [order.id, v.number, v.date || null, v.value, ewaybillNo],
      );
    }

    // Log the initial status event
    await client.query(
      `insert into order_status_events (order_id, status, note, performed_by, performed_at)
       values ($1, 'received', 'Order created via Add Order wizard', $2, now())`,
      [order.id, session.userId],
    );

    await client.query('commit');
    revalidatePath('/booking/orders');
    return { ok: true, docketNo: order.docket_no };
  } catch (e) {
    await client.query('rollback').catch(() => {});
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('orders_docket_per_org_uq')) {
      return { ok: false, error: 'A docket with this number already exists — retry' };
    }
    return { ok: false, error: msg };
  } finally {
    client.release();
  }
}
