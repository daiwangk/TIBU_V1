// src/lib/format.ts — money & distance are formatted ONLY here
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/** 35000 → "₹350" */
export const formatPrice = (paise: number) => inr.format(Math.round(paise / 100));

/** "350" | "₹350" | "350.50" → 35050 (for seller forms) */
export const toPaise = (input: string | number) =>
  Math.round(Number(String(input).replace(/[^\d.]/g, '')) * 100);

/** 850 → "850 m", 2340 → "2.3 km", null → "" */
export const formatDistance = (meters: number | null | undefined) => {
  if (meters == null) return '';
  if (meters < 1000) return `${Math.max(50, Math.round(meters / 50) * 50)} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
};
