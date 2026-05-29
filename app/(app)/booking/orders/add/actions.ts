'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { query, one } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { requireSession } from '@/lib/auth';
import { getClientDimensionConfig } from '@/lib/db/bill-to';
import { volumetricWeight, chargeableWeight, round3 } from '@/lib/utils/dimension-calc';

export type CreateOrderResult = { ok: true; docketNo: string } | { ok: false; error: string };

const MODES = new Set(['local', 'air', 'surface', 'cargo', 'train', 'courier', 'warehouse']);
const DELIVERY_TYPES = new Set(['local', 'domestic', 'international']);

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
  const length = Number(formData.get('length') ?? 0) || null;
  const breadth = Number(formData.get('breadth') ?? 0) || null;
  const height = Number(formData.get('height') ?? 0) || null;

  const ewaybillNo = String(formData.get('ewaybillNo') ?? '').trim() || null;
  const invoiceNumber = String(formData.get('invoiceNumber') ?? '').trim() || null;
  const invoiceDate = String(formData.get('invoiceDate') ?? '').trim() || null;
  const invoiceValue = Number(formData.get('invoiceValue') ?? 0) || null;

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
  let dimensionWeight: number | null = null;
  let chargeable = round3(actualWeight);
  if (clientId && length && breadth && height) {
    const cfg = await getClientDimensionConfig(clientId, mode);
    if (cfg && cfg.use_dimension === 'use_kg' && cfg.divisor_x) {
      const vol = volumetricWeight(length, breadth, height, cfg.divisor_x, cfg.multiplier_y ?? 1);
      dimensionWeight = round3(vol);
      chargeable = round3(chargeableWeight(actualWeight, vol));
    }
  }

  // Auto-generate docket number from timestamp
  const docketNo = `D${Date.now().toString().slice(-9)}`;

  try {
    const r = await one<{ docket_no: string }>(
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
        'received', 'data_entry', $14, $14, $32
      ) returning docket_no`,
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
      ],
    );

    if (!r) return { ok: false, error: 'Insert failed' };

    // Log the initial status event
    await query(
      `insert into order_status_events (order_id, status, note, performed_by, performed_at)
       select id, 'received', 'Order created via Add Order wizard', $1, now()
       from orders where docket_no = $2 and org_id = $3`,
      [session.userId, r.docket_no, orgId],
    );

    revalidatePath('/booking/orders');
    return { ok: true, docketNo: r.docket_no };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('orders_docket_per_org_uq')) {
      return { ok: false, error: 'A docket with this number already exists — retry' };
    }
    return { ok: false, error: msg };
  }
}
