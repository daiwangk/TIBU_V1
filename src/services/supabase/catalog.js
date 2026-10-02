import { haversineMeters } from '../../lib/geo.js';
import { AppError } from '../errors.js';
import { getSupabase } from './client.js';
import { mapSupabaseError } from './errors.js';
import {
  mapBusinessDetail,
  mapBusinessSummary,
  mapCategory,
  mapProductDetail,
  mapProductSummaryFromSearch,
  mapReview,
} from './mappers.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * @param {string|undefined} sort
 * @param {boolean} hasNear
 */
function resolveSort(sort, hasNear) {
  if (sort !== undefined) return sort; // pass through; SQL ignores unknown values
  return hasNear ? 'distance' : 'newest';
}

/**
 * Convert contract SearchParams → PostgREST rpc args.
 * - `p_available_today` is always a boolean
 * - `p_radius_km` omitted when `radiusKm` is undefined; `null` when `radiusKm` is null
 * - `p_limit` capped at 50
 * - min/max price × 100 → paise (products only)
 *
 * @param {import('../contract.js').SearchParams} [params]
 * @param {'business'|'product'} [kind]
 * @returns {Record<string, unknown>}
 */
export function buildSearchArgs(params = {}, kind = 'business') {
  const near = params.near ?? null;
  const hasNear = !!(near && typeof near.lat === 'number' && typeof near.lng === 'number');
  const sort = resolveSort(params.sort, hasNear);

  /** @type {Record<string, unknown>} */
  const args = {
    p_lat: hasNear ? near.lat : null,
    p_lng: hasNear ? near.lng : null,
    p_category: params.category ?? null,
    p_query: params.q ?? null,
    p_available_today: params.availableToday === true,
    p_sort: sort,
    p_limit: Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
    p_offset: params.offset ?? 0,
  };

  if (params.radiusKm === null) {
    args.p_radius_km = null;
  } else if (params.radiusKm !== undefined) {
    args.p_radius_km = params.radiusKm;
  }

  if (kind === 'product') {
    args.p_min_price_paise = params.minPrice != null ? Math.round(params.minPrice * 100) : null;
    args.p_max_price_paise = params.maxPrice != null ? Math.round(params.maxPrice * 100) : null;
  }

  return args;
}

/**
 * @param {{ lat?: number|null, lng?: number|null }} row
 * @param {{ lat: number, lng: number }|null|undefined} near
 * @returns {number|null}
 */
function distanceFromNear(row, near) {
  if (!near || typeof near.lat !== 'number' || typeof near.lng !== 'number') return null;
  if (row.lat == null || row.lng == null) return null;
  return haversineMeters(
    { lat: near.lat, lng: near.lng },
    { lat: Number(row.lat), lng: Number(row.lng) },
  );
}

/**
 * @template T
 * @param {() => Promise<{ data: T, error: unknown }>} run
 * @returns {Promise<T>}
 */
async function runQuery(run) {
  const { data, error } = await run();
  if (error) throw mapSupabaseError(error);
  return data;
}

/** @returns {Promise<import('../contract.js').Category[]>} */
export async function listCategories() {
  const data = await runQuery(() => getSupabase()
    .from('categories')
    .select('slug, name, sort_order, parent:parent_id(slug)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true }));

  return (data ?? []).map(mapCategory);
}

/**
 * @param {string} slug
 * @returns {Promise<import('../contract.js').Category|null>}
 */
export async function getCategory(slug) {
  const data = await runQuery(() => getSupabase()
    .from('categories')
    .select('slug, name, sort_order, parent:parent_id(slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle());

  return data ? mapCategory(data) : null;
}

/**
 * @param {import('../contract.js').SearchParams} [params]
 * @returns {Promise<import('../contract.js').BusinessSummary[]>}
 */
export async function searchBusinesses(params = {}) {
  const args = buildSearchArgs(params, 'business');
  const data = await runQuery(() => getSupabase().rpc('search_businesses', args));
  return (data ?? []).map((row) => mapBusinessSummary(row));
}

/**
 * @param {import('../contract.js').SearchParams} [params]
 * @returns {Promise<import('../contract.js').ProductSummary[]>}
 */
export async function searchProducts(params = {}) {
  if (params.businessId) {
    throw new AppError(
      'validation',
      'businessId filter not supported by supabase adapter yet',
    );
  }

  const args = buildSearchArgs(params, 'product');
  const data = await runQuery(() => getSupabase().rpc('search_products', args));
  return (data ?? []).map((row) => mapProductSummaryFromSearch(row));
}

/**
 * @param {string} slug
 * @param {{ near?: { lat: number, lng: number }|null }} [opts]
 * @returns {Promise<import('../contract.js').BusinessDetail|null>}
 */
export async function getBusinessBySlug(slug, opts = {}) {
  const data = await runQuery(() => getSupabase()
    .from('businesses')
    .select(`
      id, slug, name, description, address_text, locality, city, lat, lng,
      logo_url, banner_url, available_today, delivery_available, pickup_available,
      rating_avg, rating_count, approved_at,
      categories ( slug, name ),
      business_images ( id, url, sort_order ),
      business_videos ( id, instagram_url, shortcode, caption, sort_order ),
      products (
        id, name, price_paise, description, details, available_today, is_active,
        sort_order, created_at,
        product_images ( id, url, sort_order ),
        categories ( slug )
      )
    `)
    .eq('slug', slug)
    .eq('status', 'approved')
    .maybeSingle());

  if (!data) return null;
  return mapBusinessDetail(data, distanceFromNear(data, opts.near));
}

/**
 * @param {string} id
 * @param {{ near?: { lat: number, lng: number }|null }} [opts]
 * @returns {Promise<import('../contract.js').ProductDetail|null>}
 */
export async function getProductById(id, opts = {}) {
  if (!UUID_RE.test(id ?? '')) return null;

  let data;
  try {
    data = await runQuery(() => getSupabase()
      .from('products')
      .select(`
      id, name, price_paise, description, details, available_today, is_active, created_at,
      product_images ( id, url, sort_order ),
      categories ( slug ),
      businesses!inner (
        id, slug, name, description, address_text, locality, city, lat, lng,
        logo_url, banner_url, available_today, delivery_available, pickup_available,
        rating_avg, rating_count, approved_at,
        categories ( slug, name )
      )
    `)
      .eq('id', id)
      .eq('is_active', true)
      .eq('businesses.status', 'approved')
      .maybeSingle());
  } catch (err) {
    // PGRST116 (and any mapped not_found) → null for get* (CONTRACT §1 rule 2).
    const mapped = err instanceof AppError ? err : mapSupabaseError(err);
    if (
      mapped.code === 'not_found'
      || (err && typeof err === 'object' && 'code' in err && err.code === 'PGRST116')
    ) {
      return null;
    }
    throw mapped;
  }

  if (!data) return null;
  const biz = data.businesses;
  const distanceM = distanceFromNear(biz ?? {}, opts.near);
  return mapProductDetail(data, distanceM);
}

/**
 * @param {string} businessId
 * @param {{ limit?: number, offset?: number }} [opts]
 * @returns {Promise<import('../contract.js').Review[]>}
 */
export async function listReviews(businessId, opts = {}) {
  if (!UUID_RE.test(businessId ?? '')) return [];

  const limit = Math.min(opts.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = opts.offset ?? 0;
  const end = offset + limit - 1;

  const data = await runQuery(() => getSupabase()
    .from('reviews')
    .select('id, business_id, user_id, reviewer_name, rating, body, created_at, updated_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .range(offset, end));

  let currentUserId = null;
  try {
    const { data: sessionData } = await getSupabase().auth.getSession();
    currentUserId = sessionData?.session?.user?.id ?? null;
  } catch {
    currentUserId = null;
  }

  return (data ?? []).map((row) => mapReview(row, currentUserId));
}
