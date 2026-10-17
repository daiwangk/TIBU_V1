import { formatRelativeTime } from './format.js';

/**
 * Login-gate action for a guest's save tap. `saved: true` is required: the replayed handler passes it
 * straight to setSaved, and a missing value would delete instead of save.
 *
 * @param {'business'|'product'} kind
 * @param {string} id
 * @param {string} returnTo
 */
export function saveGateAction(kind, id, returnTo) {
  return { type: 'save', payload: { kind, id, saved: true }, returnTo };
}

/** `?tab=` on /saved → 'products' (default) or 'businesses'. */
export function parseSavedTab(raw) {
  return raw === 'businesses' ? 'businesses' : 'products';
}

/**
 * Items still in the saved id-set. The id-set updates optimistically, so an unsave disappears from the
 * list at once instead of after the list refetch. Before the id-set loads, the list is shown as is.
 *
 * @template {{ id: string }} T
 * @param {T[]|undefined} items
 * @param {string[]|undefined} savedIds
 * @returns {T[]}
 */
export function stillSaved(items, savedIds) {
  if (!items) return [];
  if (!savedIds) return items;
  const ids = new Set(savedIds);
  return items.filter((item) => ids.has(item.id));
}

/** "Viewed 2 h ago", or null when the time is unknown (guest views from before B3.5). */
export function viewedLabel(iso, now) {
  return iso ? `Viewed ${formatRelativeTime(iso, now)}` : null;
}

/** "WhatsApp · 3 d ago" / "Call · just now". */
export function connectedLabel(channel, iso, now) {
  return `${channel === 'call' ? 'Call' : 'WhatsApp'} · ${formatRelativeTime(iso, now)}`;
}
