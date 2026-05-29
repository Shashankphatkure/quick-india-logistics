export type OrderStatusCode =
  | 'received'
  | 'pickup_done'
  | 'arrived_at_hub'
  | 'connected'
  | 'departed'
  | 'arrived_at_destination'
  | 'out_for_delivery'
  | 'delivered'
  | 'damaged'
  | 'not_received'
  | 'cancelled';

const STATUS_TO_LABEL: Record<string, string> = {
  received: 'New',
  pickup_done: 'Picked Up',
  arrived_at_hub: 'At Hub',
  connected: 'Connected',
  departed: 'In Transit',
  arrived_at_destination: 'At Destination',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  damaged: 'Damaged',
  not_received: 'Not Received',
  cancelled: 'Cancelled',
};

export function orderStatusLabel(code: string): string {
  return STATUS_TO_LABEL[code] ?? code;
}

export const DELIVERY_TYPE_LABEL: Record<string, string> = {
  local: 'Local',
  domestic: 'Domestic',
  international: 'International',
};

/**
 * Allowed manual status transitions from the order-detail screen.
 * The happy-path forward step plus exception paths. Some forward steps
 * (connected, departed, out_for_delivery) are normally driven by the
 * Create-Manifest / Mark-Departed / Create-Runsheet workflows but are
 * also permitted manually here for flexibility.
 * `delivered` is reachable but MUST go through the Mark-Delivered (POD) flow.
 */
export const STATUS_TRANSITIONS: Record<string, OrderStatusCode[]> = {
  received: ['pickup_done', 'cancelled'],
  pickup_done: ['arrived_at_hub', 'damaged', 'not_received', 'cancelled'],
  arrived_at_hub: ['connected', 'damaged', 'not_received', 'cancelled'],
  connected: ['departed', 'damaged', 'cancelled'],
  departed: ['arrived_at_destination', 'damaged', 'not_received'],
  arrived_at_destination: ['out_for_delivery', 'delivered', 'damaged', 'not_received'],
  out_for_delivery: ['delivered', 'not_received', 'damaged'],
  delivered: [],
  damaged: [],
  not_received: ['out_for_delivery'],
  cancelled: [],
};

export function nextStatuses(current: string): OrderStatusCode[] {
  return STATUS_TRANSITIONS[current] ?? [];
}

/** Statuses that need the POD capture flow rather than a plain status update. */
export const DELIVER_STATUSES = new Set(['delivered']);

export type OrderListItem = {
  id: string;
  docket_no: string;
  booking_date: string;
  client_name: string | null;
  bill_to_name: string | null;
  shipper_name: string;
  consignee_name: string;
  origin: string;
  destination: string;
  mode: string;
  delivery_type: string;
  is_cold_chain: boolean;
  status: string;
  priority: string;
  current_branch_name: string | null;
};
