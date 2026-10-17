/**
 * Saved items adapter — src/services/supabase/saved.js
 *
 * getSavedIds()           → SavedIds
 * listSavedBusinesses()   → BusinessSummary[]  (newest saved first, approved only)
 * listSavedProducts()     → ProductSummary[]   (newest saved first, active + approved)
 * setSaved({ kind, id, saved }) → void
 *
 * RLS on saved_businesses / saved_products restricts all operations to the
 * authenticated user's own rows (user_id = auth.uid()). No phone/whatsapp columns
 * are selected anywhere in this file (AGENTS §3).
 */

import { AppError } from '../errors.js';
import { getSupabase } from './client.js';
import { mapSupabaseError } from './errors.js';
import { mapBusinessSummary, mapProductSummaryNested } from './mappers.js';
import { BIZ_SUMMARY_COLS, PRODUCT_SUMMARY_COLS } from './selects.js';


/**
 * Returns the IDs of every saved business and product for the current user.
 * Two parallel selects; RLS restricts rows to auth.uid().
 *
 * @returns {Promise<import('../contract.js').SavedIds>}
 */
export async function getSavedIds() {
  const [{ data: bizRows, error: bizErr }, { data: prodRows, error: prodErr }] =
    await Promise.all([
      getSupabase().from('saved_businesses').select('business_id'),
      getSupabase().from('saved_products').select('product_id'),
    ]);

  if (bizErr) throw mapSupabaseError(bizErr);
  if (prodErr) throw mapSupabaseError(prodErr);

  return {
    businessIds: (bizRows ?? []).map((r) => String(r.business_id)),
    productIds: (prodRows ?? []).map((r) => String(r.product_id)),
  };
}

/**
 * All saved businesses, newest-saved first.
 * Filters out any that are no longer approved (de-listed after saving).
 *
 * @returns {Promise<import('../contract.js').BusinessSummary[]>}
 */
export async function listSavedBusinesses() {
  const { data, error } = await getSupabase()
    .from('saved_businesses')
    .select(`created_at, businesses!inner ( ${BIZ_SUMMARY_COLS} )`)
    .order('created_at', { ascending: false });

  if (error) throw mapSupabaseError(error);

  return (data ?? [])
    .filter((r) => r.businesses?.status === 'approved')
    .map((r) => mapBusinessSummary(r.businesses));
}

/**
 * All saved products, newest-saved first.
 * Filters out inactive products and those from non-approved businesses.
 *
 * @returns {Promise<import('../contract.js').ProductSummary[]>}
 */
export async function listSavedProducts() {
  const { data, error } = await getSupabase()
    .from('saved_products')
    .select(
      `created_at,
       products!inner (
         ${PRODUCT_SUMMARY_COLS},
         businesses!inner ( ${BIZ_SUMMARY_COLS} )
       )`,
    )
    .order('created_at', { ascending: false });

  if (error) throw mapSupabaseError(error);

  return (data ?? [])
    .filter(
      (r) =>
        r.products?.is_active !== false &&
        r.products?.businesses?.status === 'approved',
    )
    .map((r) => {
      const biz = mapBusinessSummary(r.products.businesses);
      return mapProductSummaryNested(r.products, biz, null);
    })
    .filter(Boolean);
}

/**
 * Insert or remove a saved row for the authenticated user.
 * Insert is idempotent (ON CONFLICT DO NOTHING).
 * Delete is scoped to the current user by RLS.
 *
 * @param {{ kind: 'business'|'product', id: string, saved: boolean }} params
 * @returns {Promise<void>}
 */
export async function setSaved({ kind, id, saved }) {
  const {
    data: { session },
  } = await getSupabase().auth.getSession();

  if (!session?.user?.id) {
    throw new AppError('auth_required', 'You must be logged in to save items');
  }
  const userId = session.user.id;

  if (kind === 'business') {
    const { error } = saved
      ? await getSupabase()
          .from('saved_businesses')
          .upsert(
            { user_id: userId, business_id: id },
            { onConflict: 'user_id,business_id', ignoreDuplicates: true },
          )
      : await getSupabase()
          .from('saved_businesses')
          .delete()
          .eq('business_id', id);
    if (error) throw mapSupabaseError(error);
    return;
  }

  if (kind === 'product') {
    const { error } = saved
      ? await getSupabase()
          .from('saved_products')
          .upsert(
            { user_id: userId, product_id: id },
            { onConflict: 'user_id,product_id', ignoreDuplicates: true },
          )
      : await getSupabase()
          .from('saved_products')
          .delete()
          .eq('product_id', id);
    if (error) throw mapSupabaseError(error);
    return;
  }

  throw new AppError('validation', `setSaved: unknown kind "${kind}"`);
}
