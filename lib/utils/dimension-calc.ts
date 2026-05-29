// Client-safe (no 'server-only'): volumetric + chargeable weight math.
// Volumetric weight = (L × B × H) / divisor_x × multiplier_y  (L,B,H in cm, result in kg).
// Chargeable weight = max(actual, volumetric). Used both for the live add-order
// preview and as the authoritative server-side computation.

export function volumetricWeight(
  lengthCm: number,
  breadthCm: number,
  heightCm: number,
  divisorX: number,
  multiplierY = 1,
): number {
  if (!lengthCm || !breadthCm || !heightCm || !divisorX) return 0;
  return ((lengthCm * breadthCm * heightCm) / divisorX) * multiplierY;
}

export function chargeableWeight(actualKg: number, volumetricKg: number): number {
  return Math.max(actualKg || 0, volumetricKg || 0);
}

export function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
