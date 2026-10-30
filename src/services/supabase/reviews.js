/**
 * Reviews adapter — CONTRACT §3, §7, §11, §12.
 *
 * Direct table operations (no RPC for reviews); RLS enforces:
 *   - insert: authenticated, not business owner, business must be approved
 *   - update: own row only
 *   - delete: own row (or admin)
 *
 * The tg_reviews_before trigger sets user_id = auth.uid() on insert/update,
 * so we never need to send user_id in the payload.
 * The tg_reviews_after trigger recomputes business rating_avg/rating_count.
 */

import { AppError } from '../errors.js';
import { getSupabase } from './client.js';
import { mapSupabaseError } from './errors.js';
import { mapReview } from './mappers.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const REVIEW_COLS = 'id, business_id, user_id, reviewer_name, rating, body, created_at, updated_at';

/**
 * Returns the current session's user id, or throws auth_required.
 * @returns {Promise<string>}
 */
async function requireUserId() {
  const { data, error } = await getSupabase().auth.getSession();
  if (error || !data?.session?.user?.id) {
    throw new AppError('auth_required', 'You must be signed in');
  }
  return data.session.user.id;
}

/**
 * Client-side validation of review fields (mirrors DB CHECK constraints).
 * @param {{ rating?: unknown, body?: unknown }} params
 */
function validateReview({ rating, body }) {
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    throw new AppError('validation', 'Rating must be a whole number between 1 and 5');
  }
  if (typeof body === 'string' && body.length > 1000) {
    throw new AppError('validation', 'Review body must be 1000 characters or fewer');
  }
}

/**
 * Get the current user's review for a business, or null if they haven't reviewed it.
 *
 * @param {string} businessId
 * @returns {Promise<import('../contract.js').Review|null>}
 */
export async function getMyReview(businessId) {
  if (!UUID_RE.test(businessId ?? '')) return null;
  const userId = await requireUserId();

  const { data, error } = await getSupabase()
    .from('reviews')
    .select(REVIEW_COLS)
    .eq('business_id', businessId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw mapSupabaseError(error);
  if (!data) return null;
  return mapReview(data, userId);
}

/**
 * Upsert the current user's review for a business.
 * Creates if none exists; updates if one does (unique constraint: business_id + user_id).
 *
 * @param {{ businessId: string, rating: number, body: string }} params
 * @returns {Promise<import('../contract.js').Review>}
 */
export async function saveMyReview({ businessId, rating, body }) {
  if (!UUID_RE.test(businessId ?? '')) {
    throw new AppError('validation', 'Invalid business ID');
  }
  validateReview({ rating, body });

  const userId = await requireUserId();

  const { data, error } = await getSupabase()
    .from('reviews')
    .upsert(
      { business_id: businessId, rating: Math.round(Number(rating)), body: String(body ?? '').trim() },
      { onConflict: 'business_id,user_id' },
    )
    .select(REVIEW_COLS)
    .single();

  if (error) throw mapSupabaseError(error);
  return mapReview(data, userId);
}

/**
 * Delete the current user's review for a business.
 *
 * @param {string} businessId
 * @returns {Promise<void>}
 */
export async function deleteMyReview(businessId) {
  if (!UUID_RE.test(businessId ?? '')) {
    throw new AppError('validation', 'Invalid business ID');
  }
  const userId = await requireUserId();

  const { error } = await getSupabase()
    .from('reviews')
    .delete()
    .eq('business_id', businessId)
    .eq('user_id', userId);

  if (error) throw mapSupabaseError(error);
}
