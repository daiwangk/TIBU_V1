/**
 * offerService — thin wrapper around hardcoded offer data.
 * Replace function bodies with real API calls when the backend is ready.
 * Signatures MUST remain the same.
 *
 * NOTE: Offers data currently lives inline in Offers.jsx and Notification.jsx
 * with conflicting content (audit §3.2). Until a backend unifies them, this
 * service holds the canonical copy — Offers.jsx and Notification.jsx should
 * be updated to import from here in a future task.
 */

import { normalizedOffers } from './mock/normalize';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const NETWORK_DELAY = 150;

export async function listOffers() {
  await delay(NETWORK_DELAY);
  return normalizedOffers;
}

export async function getOfferById(id) {
  await delay(NETWORK_DELAY);
  return normalizedOffers.find((o) => o.id === id) ?? null;
}

