/**
 * products.details (jsonb) ⇄ contract `details: Array<{ label, value }>` (CONTRACT §3, DECISIONS D36).
 *
 * Two storage forms exist:
 *  - legacy object form, used by scripts/seed-dev.mjs: { "weight": "500g", "shelf_life": "10 days" }
 *  - array form, written by the app from Rev2 onward:  [{ "label": "Weight", "value": "500g" }]
 * Read both; always write the array form (keeps the seller's order and their own labels).
 */

export const DETAILS_MAX_ROWS = 12;
export const DETAIL_LABEL_MAX = 40;
export const DETAIL_VALUE_MAX = 200;

/** 'shelf_life' → 'Shelf life' */
export function humanizeKey(key) {
  const words = String(key).replace(/[_-]+/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1).toLowerCase() : '';
}

const clean = (s) => (s == null ? '' : String(s).trim());

/** @param {unknown} raw @returns {Array<{label: string, value: string}>} */
export function detailsFromDb(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map((r) => ({ label: clean(r?.label), value: clean(r?.value) }))
      .filter((r) => r.label && r.value);
  }
  if (raw && typeof raw === 'object') {
    return Object.entries(raw)
      .map(([k, v]) => ({ label: humanizeKey(k), value: clean(v) }))
      .filter((r) => r.label && r.value);
  }
  return [];
}

/** @param {Array<{label: string, value: string}>} rows @returns {Array<{label: string, value: string}>} */
export function detailsToDb(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((r) => ({ label: clean(r?.label).slice(0, DETAIL_LABEL_MAX), value: clean(r?.value).slice(0, DETAIL_VALUE_MAX) }))
    .filter((r) => r.label && r.value)
    .slice(0, DETAILS_MAX_ROWS);
}
