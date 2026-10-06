/**
 * Display helpers — docs/CONTRACT.md §9.
 */

/**
 * @param {number} rupees integer rupees
 * @returns {string}
 */
export function formatPrice(rupees) {
  const n = Number(rupees) || 0;
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)}`;
}

/**
 * @param {number|null|undefined} m metres
 * @returns {string}
 */
export function formatDistance(m) {
  if (m == null || !Number.isFinite(Number(m))) return '';
  const metres = Math.max(0, Number(m));
  // Round to the nearest 100 m first, so 950–999 m reads "1.0 km" rather than "1000 m".
  const rounded = Math.round(metres / 100) * 100;
  if (rounded < 1000) return `${Math.max(rounded, 100)} m`;
  return `${(rounded / 1000).toFixed(1)} km`;
}

/**
 * @param {number|null|undefined} rating
 * @param {number} [reviewCount]
 * @returns {string}
 */
export function formatRating(rating, reviewCount) {
  if (reviewCount === 0 || rating == null || rating === 0) return 'New';
  return (Math.round(Number(rating) * 10) / 10).toFixed(1);
}

/**
 * @param {string} iso
 * @param {Date} [now]
 * @returns {string}
 */
export function formatRelativeTime(iso, now = new Date()) {
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  if (Number.isNaN(then)) return '';

  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} d ago`;

  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
