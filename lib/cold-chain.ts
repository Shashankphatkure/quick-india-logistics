// Client-safe (no 'server-only'): cold-chain SLA tiers computed from hours elapsed
// since booking. Cold-chain gel-pack / dry-ice shipments must clear within ~40-48h,
// so we warn at 40h and flag a breach at 48h.
import type { BadgeColor } from '@/lib/ui-types';

export type ColdChainTier = 'ok' | 'warning' | 'breach';

const WARNING_HOURS = 40;
const BREACH_HOURS = 48;

export function coldChainTier(hours: number | null | undefined): ColdChainTier {
  if (hours == null) return 'ok';
  if (hours >= BREACH_HOURS) return 'breach';
  if (hours >= WARNING_HOURS) return 'warning';
  return 'ok';
}

export const COLD_CHAIN_TIER_META: Record<Exclude<ColdChainTier, 'ok'>, { label: string; color: BadgeColor }> = {
  warning: { label: 'SLA 40h+', color: 'orange' },
  breach: { label: 'SLA Breach', color: 'red' },
};
