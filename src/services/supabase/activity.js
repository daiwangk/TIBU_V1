/**
 * Activity adapter — src/services/supabase/activity.js
 *
 * trackView({ kind, id })       → void   (RPC track_view)
 * listRecent({ limit })         → RecentItem[]  (recent_views table, newest first)
 * listConnected({ limit })      → ConnectedItem[]  (RPC my_connected_businesses)
 *
 * Money: price_paise → rupees conversion happens here (AGENTS §3 rule).
 * Contacts: business_contacts is never selected (AGENTS §3).
 * RLS: recent_views rows are own-read / own-delete only; insert via RPC only.
 */

import { getSupabase } from './client.js';
import { mapSupabaseError } from './errors.js';
import { paiseToRupees } from './mappers.js';

// ---------------------------------------------------------------------------
// trackView
// ---------------------------------------------------------------------------

/**
 * Records a view for the authenticated user via the track_view() RPC.
 * The RPC is a no-op when called with no uid (should not reach here for guests).
 *
 * @param {{ kind: 'business'|'product', id: string }} params
 * @returns {Promise<void>}
 */
export async function trackView({ kind, id }) {
  const args =
    kind === 'business' ? { p_business: id } : { p_product: id };

  try {
    await getSupabase().rpc('track_view', args);
  } catch {
    // Silently ignore errors — a failed view-track must not disrupt the UX.
  }
}

// ---------------------------------------------------------------------------
// listRecent helpers
// ---------------------------------------------------------------------------

/**
 * Map a businesses embed from recent_views → BusinessRef.
 * Returns null when the embed is absent (deleted / unapproved).
 *
 * @param {object|null|undefined} row
 * @returns {import('../contract.js').BusinessRef|null}
 */
function mapBusinessRef(row) {
  if (!row?.id || !row?.slug) return null;
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name ?? ''),
    logoUrl: row.logo_url ?? null,
    locality: String(row.locality ?? ''),
  };
}

/**
 * Map a products embed from recent_views → ProductRef.
 * Returns null when the embed is absent (deleted / inactive).
 * Picks the first image sorted by sort_order (client-side; PostgREST embedded
 * selects don't support ORDER BY in the select string).
 *
 * @param {object|null|undefined} row
 * @returns {import('../contract.js').ProductRef|null}
 */
function mapProductRef(row) {
  if (!row?.id || !row?.name) return null;

  const images = Array.isArray(row.product_images) ? row.product_images : [];
  const sorted = [...images].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  const imageUrl = sorted[0]?.url ?? null;

  return {
    id: String(row.id),
    name: String(row.name),
    price: paiseToRupees(row.price_paise),
    imageUrl,
  };
}

// ---------------------------------------------------------------------------
// listRecent
// ---------------------------------------------------------------------------

/**
 * Returns the current user's recently viewed items, newest first.
 * Rows whose embedded business or product is null (no longer public) are skipped.
 *
 * @param {{ limit?: number }} [params]
 * @returns {Promise<import('../contract.js').RecentItem[]>}
 */
export async function listRecent({ limit = 30 } = {}) {
  const { data, error } = await getSupabase()
    .from('recent_views')
    .select(
      'viewed_at, business_id, product_id, ' +
      'businesses ( id, slug, name, logo_url, locality ), ' +
      'products ( id, name, price_paise, product_images ( url, sort_order ) )',
    )
    .order('viewed_at', { ascending: false })
    .limit(limit);

  if (error) throw mapSupabaseError(error);

  /** @type {import('../contract.js').RecentItem[]} */
  const items = [];

  for (const row of data ?? []) {
    if (row.business_id) {
      const biz = mapBusinessRef(row.businesses);
      if (!biz) continue; // business deleted / unapproved
      items.push({
        kind: 'business',
        viewedAt: String(row.viewed_at),
        business: biz,
      });
    } else if (row.product_id) {
      const prod = mapProductRef(row.products);
      if (!prod) continue; // product deleted / inactive
      items.push({
        kind: 'product',
        viewedAt: String(row.viewed_at),
        product: prod,
      });
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// listConnected
// ---------------------------------------------------------------------------

/**
 * Returns distinct businesses the current user has contacted, newest first.
 * Uses the my_connected_businesses() RPC (newest-first fix in migration 0007).
 *
 * @param {{ limit?: number }} [params]
 * @returns {Promise<import('../contract.js').ConnectedItem[]>}
 */
export async function listConnected({ limit = 30 } = {}) {
  const { data, error } = await getSupabase().rpc(
    'my_connected_businesses',
    { p_limit: limit },
  );

  if (error) throw mapSupabaseError(error);

  return (data ?? []).map((row) => ({
    channel: /** @type {'whatsapp'|'call'} */ (String(row.last_channel)),
    contactedAt: String(row.last_contacted_at),
    business: {
      id: String(row.business_id),
      slug: String(row.slug),
      name: String(row.name),
      logoUrl: row.logo_url ?? null,
      locality: String(row.locality ?? ''),
    },
  }));
}
