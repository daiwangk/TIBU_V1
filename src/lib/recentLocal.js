/**
 * recentLocal — src/lib/recentLocal.js
 *
 * Guest-side recent views stored in localStorage under 'tibu.recent'.
 * Each entry is { kind: 'business'|'product', id: string, viewedAt?: string } where:
 *   - kind === 'business' → id is the business slug  (matches /b/:slug route)
 *   - kind === 'product'  → id is the product UUID   (matches /p/:productId route)
 *   - viewedAt is the ISO time of the view (B3.5). Entries written before B3.5 have none and stay valid.
 *
 * Rules:
 *   - Max 30 entries. Newest first.
 *   - Deduplication: same kind + id → move existing entry to front.
 *   - On login: push all local items through trackView (oldest first), then clear.
 */

const STORAGE_KEY = 'tibu.recent';
const MAX_ITEMS = 30;

/**
 * @typedef {{ kind: 'business'|'product', id: string, viewedAt?: string }} LocalRecentEntry
 */

/**
 * Read the stored list. Returns an empty array on parse error.
 * @returns {LocalRecentEntry[]}
 */
function readList() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e) =>
          e &&
          (e.kind === 'business' || e.kind === 'product') &&
          typeof e.id === 'string' &&
          e.id.length > 0,
      )
      .map((e) => (typeof e.viewedAt === 'string' ? { kind: e.kind, id: e.id, viewedAt: e.viewedAt } : { kind: e.kind, id: e.id }));
  } catch {
    return [];
  }
}

/**
 * Persist the list (silently swallow storage-full errors).
 * @param {LocalRecentEntry[]} list
 */
function writeList(list) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // storage quota — skip silently
  }
}

/**
 * Push a view to the front of the local list.
 * Deduplicates by kind + id; moves duplicate to front.
 * Caps at MAX_ITEMS (30).
 *
 * @param {{ kind: 'business'|'product', id: string }} entry
 */
export function pushLocal({ kind, id }) {
  const list = readList().filter((e) => !(e.kind === kind && e.id === id));
  list.unshift({ kind, id, viewedAt: new Date().toISOString() });
  writeList(list.slice(0, MAX_ITEMS));
}

/**
 * Return all stored entries (newest first).
 * @returns {LocalRecentEntry[]}
 */
export function getLocal() {
  return readList();
}

/**
 * Clear the local list (call after flushing to the server on login).
 */
export function clearLocal() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
