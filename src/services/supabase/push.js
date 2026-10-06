import { getSupabase } from './client.js';
import { mapSupabaseError } from './errors.js';

/**
 * Store (or take over) this browser's Web Push subscription for the signed-in user.
 * RPC `save_push_subscription` (migration 0009) — guests get `auth_required`.
 *
 * @param {{ endpoint: string, p256dh: string, auth: string }} subscription
 * @returns {Promise<void>}
 */
export async function savePushSubscription({ endpoint, p256dh, auth }) {
  const userAgent = typeof navigator === 'undefined' ? null : navigator.userAgent;
  const { error } = await getSupabase().rpc('save_push_subscription', {
    p_endpoint: endpoint,
    p_p256dh: p256dh,
    p_auth: auth,
    p_user_agent: userAgent,
  });
  if (error) throw mapSupabaseError(error);
}

/**
 * Remove one of the signed-in user's push subscriptions.
 * RPC `delete_push_subscription` (migration 0009).
 *
 * @param {string} endpoint
 * @returns {Promise<void>}
 */
export async function deletePushSubscription(endpoint) {
  const { error } = await getSupabase().rpc('delete_push_subscription', { p_endpoint: endpoint });
  if (error) throw mapSupabaseError(error);
}
