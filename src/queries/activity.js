/**
 * Activity queries — src/queries/activity.js
 *
 * useTrackView(kind, id, { enabled })
 *   Fires once per mount when `enabled` becomes true.
 *   authenticated → service trackView();  guest → recentLocal.pushLocal()
 *
 * useRecent()
 *   authenticated → service listRecent(); guest → resolves local ids via catalog
 *   queries (skips items that return null).
 *
 * useConnected()
 *   authenticated + supabase only → service listConnected()
 *
 * flushLocalRecent(trackViewFn)
 *   Called by GateResumer on login. Pushes local items to the server oldest-first,
 *   then clears the local list. Fire-and-forget; errors are swallowed.
 */

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth.js';
import { dataSource, getBusinessBySlug, getProductById, listConnected, listRecent, trackView } from '../services/index.js';
import { pushLocal, getLocal, clearLocal } from '../lib/recentLocal.js';
import { qk } from './keys.js';

// ---------------------------------------------------------------------------
// useTrackView
// ---------------------------------------------------------------------------

/**
 * Fires one view-track per mount when the entity data is ready.
 *
 * Rules of Hooks: always called unconditionally at the top of the consuming
 * component. The `enabled` flag (passed as `!!data`) controls whether the
 * effect actually runs.
 *
 * @param {'business'|'product'} kind
 * @param {string} id   local id — product UUID *or* business slug (stored in guest localStorage)
 * @param {{ enabled?: boolean, serverId?: string }} [opts]
 *   serverId — UUID sent to the RPC when it differs from `id`.
 *              BusinessPage passes `business.id` here; ProductPage omits it (id is the UUID).
 */
export function useTrackView(kind, id, { enabled = true, serverId } = {}) {
  const authStatus = useAuthStore((s) => s.status);
  const hasFired = useRef(false);

  useEffect(() => {
    // Reset when the entity changes (e.g. navigation to a different page)
    hasFired.current = false;
  }, [kind, id, serverId]);

  useEffect(() => {
    if (!enabled || hasFired.current || !id) return;
    hasFired.current = true;

    if (authStatus === 'authenticated') {
      // Auth path: use serverId (UUID) when provided; otherwise fall back to id.
      // Business pages pass business.id as serverId; product pages pass UUID as id.
      const rpcId = serverId || id;
      trackView({ kind, id: rpcId }).catch(() => {});
    } else {
      // Guest path: store the local id (slug for businesses, UUID for products).
      pushLocal({ kind, id });
    }
  }, [enabled, kind, id, serverId, authStatus]);
}


// ---------------------------------------------------------------------------
// useRecent
// ---------------------------------------------------------------------------

/**
 * Recent views list.
 * - authenticated + supabase: server list
 * - authenticated + mock: disabled (mock throws unavailable_in_mock)
 * - guest: resolves local ids through the catalog service (items gone from DB → null → skipped)
 *
 * @returns {import('@tanstack/react-query').UseQueryResult<import('../services/contract.js').RecentItem[]>}
 */
export function useRecent() {
  const authStatus = useAuthStore((s) => s.status);
  const isAuthenticated = authStatus === 'authenticated';
  const isSupabase = dataSource === 'supabase';

  // Server query — runs when authenticated and using supabase
  const serverQuery = useQuery({
    queryKey: qk.recent,
    queryFn: () => listRecent({ limit: 30 }),
    enabled: isAuthenticated && isSupabase,
    staleTime: 30_000,
    meta: { silent: true },
  });

  // Guest query — resolves local entries through the catalog service
  const guestQuery = useQuery({
    queryKey: [...qk.recent, 'guest'],
    queryFn: async () => {
      const entries = getLocal(); // newest-first
      const results = await Promise.all(
        entries.map(async (entry) => {
          try {
            if (entry.kind === 'business') {
              const biz = await getBusinessBySlug(entry.id, {});
              if (!biz) return null;
              return /** @type {import('../services/contract.js').RecentItem} */ ({
                kind: 'business',
                viewedAt: entry.viewedAt ?? null, // entries from before B3.5 have no time
                business: {
                  id: biz.id,
                  slug: biz.slug,
                  name: biz.name,
                  logoUrl: biz.logoUrl,
                  locality: biz.locality,
                },
              });
            } else {
              const prod = await getProductById(entry.id, {});
              if (!prod) return null;
              return /** @type {import('../services/contract.js').RecentItem} */ ({
                kind: 'product',
                viewedAt: entry.viewedAt ?? null,
                product: {
                  id: prod.id,
                  name: prod.name,
                  price: prod.price,
                  imageUrl: prod.imageUrl,
                },
              });
            }
          } catch {
            return null;
          }
        }),
      );
      return results.filter(Boolean);
    },
    enabled: !isAuthenticated && authStatus !== 'loading',
    staleTime: 60_000,
    meta: { silent: true },
  });

  return isAuthenticated ? serverQuery : guestQuery;
}

// ---------------------------------------------------------------------------
// useConnected
// ---------------------------------------------------------------------------

/**
 * Previously-contacted businesses (authenticated + supabase only).
 *
 * @returns {import('@tanstack/react-query').UseQueryResult<import('../services/contract.js').ConnectedItem[]>}
 */
export function useConnected() {
  const authStatus = useAuthStore((s) => s.status);
  const isAuthenticated = authStatus === 'authenticated';
  const isSupabase = dataSource === 'supabase';

  return useQuery({
    queryKey: qk.connected,
    queryFn: () => listConnected({ limit: 30 }),
    enabled: isAuthenticated && isSupabase,
    staleTime: 30_000,
    meta: { silent: true },
  });
}

// ---------------------------------------------------------------------------
// flushLocalRecent — called once on login (from GateResumer)
// ---------------------------------------------------------------------------

/**
 * Push all locally stored recent views to the server, oldest first, then clear
 * the local list. Fire-and-forget — errors per item are swallowed so one bad
 * item doesn't block the rest.
 *
 * @returns {Promise<void>}
 */
export async function flushLocalRecent() {
  const entries = getLocal(); // newest-first
  if (entries.length === 0) return;

  // Push oldest first so the server ends up with newest-first order
  const reversed = [...entries].reverse();
  for (const entry of reversed) {
    try {
      let rpcId = entry.id;
      if (entry.kind === 'business') {
        // Local stores slug; RPC needs UUID. Resolve via catalog (may return null).
        const biz = await getBusinessBySlug(entry.id, {});
        if (!biz) continue; // business gone — skip
        rpcId = biz.id;
      }
      await trackView({ kind: entry.kind, id: rpcId });
    } catch {
      // swallow per-item errors; don't block subsequent entries
    }
  }

  clearLocal();
}
