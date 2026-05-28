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
