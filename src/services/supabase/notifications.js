/**
 * Notifications adapter — CONTRACT §6–§7.
 * List/update own rows under RLS. The only writable column is `read_at`.
 */

import { getSupabase } from './client.js';
import { mapSupabaseError } from './errors.js';
import { mapNotification } from './mappers.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/**
 * Newest-first inbox for the signed-in user.
 *
 * @param {{ limit?: number, offset?: number }} [params]
 * @returns {Promise<import('../contract.js').Notification[]>}
 */
export async function listNotifications({ limit, offset } = {}) {
  const take = Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const skip = offset ?? 0;
  const { data, error } = await getSupabase()
    .from('notifications')
    .select('id, type, title, body, link, created_at, read_at')
    .order('created_at', { ascending: false })
    .range(skip, skip + take - 1);
  if (error) throw mapSupabaseError(error);
  return (data ?? []).map(mapNotification);
}

/**
 * Mark notifications read. `'all'` = unread rows only. Only `read_at` is written.
 *
 * @param {string[]|'all'} ids
 * @returns {Promise<void>}
 */
export async function markNotificationsRead(ids) {
  if (ids !== 'all' && (!Array.isArray(ids) || ids.length === 0)) return;

  let query = getSupabase()
    .from('notifications')
    .update({ read_at: new Date().toISOString() });

  query = ids === 'all' ? query.is('read_at', null) : query.in('id', ids);

  const { error } = await query;
  if (error) throw mapSupabaseError(error);
}

/**
 * Unread in-app notifications plus unread enquiry messages (both roles).
 *
 * @returns {Promise<{ notifications: number, enquiries: number }>}
 */
export async function getUnreadCounts() {
  const { data, error } = await getSupabase().rpc('unread_counts');
  if (error) throw mapSupabaseError(error);
  const row = Array.isArray(data) ? data[0] : data;
  return {
    notifications: Number(row?.notifications ?? 0),
    enquiries: Number(row?.enquiries ?? 0),
  };
}
