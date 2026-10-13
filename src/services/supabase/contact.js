/**
 * revealContact — src/services/supabase/contact.js
 *
 * Calls the reveal_contact RPC and returns ContactInfo.
 * CONTRACT §7 contact row: revealContact({ businessId, channel, productId }) → ContactInfo
 *
 * RPC params (from 20260925000004_rpc.sql):
 *   p_business uuid  (required)
 *   p_channel  contact_channel  'whatsapp'|'call'  (required)
 *   p_product  uuid  (optional, default null)
 *
 * The RPC returns a table row (phone, whatsapp).
 * Supabase wraps it as an array — take [0].
 * An empty array (no contacts row) → { phone: null, whatsapp: null }.
 *
 * Error codes (CONTRACT §11 / errors.js):
 *   login_required  → auth_required
 *   business_not_available
 *   rate_limited  (60 reveals/hour per user)
 */

import { getSupabase } from './client.js';
import { mapSupabaseError } from './errors.js';

/**
 * Reveal the seller's contact numbers for the given channel.
 * Requires an authenticated session.
 *
 * @param {{ businessId: string, channel: 'whatsapp'|'call', productId?: string|null }} params
 * @returns {Promise<import('../contract.js').ContactInfo>}
 */
export async function revealContact({ businessId, channel, productId = null }) {
  const { data, error } = await getSupabase().rpc('reveal_contact', {
    p_business: businessId,
    p_channel: channel,
    p_product: productId ?? null,
  });

  if (error) throw mapSupabaseError(error);

  // RPC returns a set — Supabase JS wraps it as an array.
  // An empty array means the business has no contacts row.
  const row = Array.isArray(data) ? data[0] : null;
  return {
    phone: row?.phone ?? null,
    whatsapp: row?.whatsapp ?? null,
  };
}
