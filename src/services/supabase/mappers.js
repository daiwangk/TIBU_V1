/**
 * Map DB / RPC rows → contract shapes. Money conversion lives here only (AGENTS §3).
 * Never map contact columns.
 */

/**
 * @param {number|null|undefined} paise
 * @returns {number}
 */
export function paiseToRupees(paise) {
  return Math.round(Number(paise || 0) / 100);
}

/**
 * Prefer a database/RPC distance over the adapter's haversine fallback.
 * @param {{ distance_m?: number|null }|null|undefined} row
 * @param {number|null|undefined} fallback
 * @returns {number|null}
 */
function mapDistanceM(row, fallback) {
  if (row?.distance_m != null) return Number(row.distance_m);
  return fallback == null ? null : fallback;
}

/**
 * @param {unknown} details
 * @returns {Array<{ label: string, value: string }>}
 */
export function mapDetails(details) {
  if (details == null) return [];
  if (Array.isArray(details)) {
    return details
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const label = 'label' in item ? String(item.label) : '';
        const value = 'value' in item ? String(item.value) : '';
        return label ? { label, value } : null;
      })
      .filter(Boolean);
  }
  if (typeof details === 'object') {
    return Object.entries(details).map(([label, value]) => ({
      label,
      value: value == null ? '' : String(value),
    }));
  }
  return [];
}

/**
 * @template {{ sort_order?: number|null }} T
 * @param {T[]|null|undefined} rows
 * @returns {T[]}
 */
export function bySortOrder(rows) {
  return [...(rows ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
}

/**
 * @param {{ id?: string, url?: string }|null|undefined} row
 * @returns {{ id: string, url: string }|null}
 */
export function mapImage(row) {
  if (!row?.id || !row?.url) return null;
  return { id: String(row.id), url: String(row.url) };
}

/**
 * @param {object|null|undefined} row
 * @returns {{ id: string, instagramUrl: string, shortcode: string, caption: string }|null}
 */
export function mapVideo(row) {
  if (!row?.id || !row?.shortcode) return null;
  return {
    id: String(row.id),
    instagramUrl: String(row.instagram_url ?? ''),
    shortcode: String(row.shortcode),
    caption: String(row.caption ?? ''),
  };
}

/**
 * @param {object} row category row with optional `parent: { slug }` or `parent_slug`
 * @returns {{ slug: string, name: string, parentSlug: string|null, sortOrder: number }}
 */
export function mapCategory(row) {
  const parentSlug =
    row.parent_slug
    ?? row.parent?.slug
    ?? null;
  return {
    slug: String(row.slug),
    name: String(row.name),
    parentSlug: parentSlug == null ? null : String(parentSlug),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

/**
 * @param {object} row search_businesses RPC or businesses table row
 * @param {number|null} [distanceM] haversine fallback when `row.distance_m` is absent
 * @returns {import('../contract.js').BusinessSummary}
 */
export function mapBusinessSummary(row, distanceM) {
  const categorySlug = row.category_slug ?? row.categories?.slug ?? '';
  const categoryName = row.category_name ?? row.categories?.name ?? '';
  const dist = mapDistanceM(row, distanceM);

  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    categorySlug: String(categorySlug),
    categoryName: String(categoryName),
    logoUrl: row.logo_url ?? null,
    bannerUrl: row.banner_url ?? null,
    locality: String(row.locality ?? ''),
    city: String(row.city ?? 'Mumbai'),
    distanceM: dist,
    rating: Number(row.rating_avg ?? row.rating ?? 0),
    reviewCount: Number(row.rating_count ?? row.review_count ?? 0),
    availableToday: Boolean(row.available_today),
    deliveryAvailable: Boolean(row.delivery_available),
    pickupAvailable: Boolean(row.pickup_available),
    approvedAt: row.approved_at == null ? null : String(row.approved_at),
  };
}

/**
 * @param {object} row search_products RPC row
 * @param {number|null} [distanceM] haversine fallback when `row.distance_m` is absent
 * @returns {import('../contract.js').ProductSummary}
 */
export function mapProductSummaryFromSearch(row, distanceM) {
  const dist = mapDistanceM(row, distanceM);

  return {
    id: String(row.id),
    name: String(row.name),
    price: paiseToRupees(row.price_paise),
    imageUrl: row.image_url ?? null,
    categorySlug: String(row.category_slug ?? ''),
    availableToday: Boolean(row.available_today),
    businessId: String(row.business_id),
    businessSlug: String(row.business_slug),
    businessName: String(row.business_name),
    businessLogoUrl: row.business_logo_url ?? null,
    businessRating: Number(row.rating_avg ?? 0),
    locality: String(row.locality ?? ''),
    distanceM: dist,
    createdAt: String(row.created_at ?? ''),
  };
}

/**
 * Nested product under a business detail select.
 *
 * @param {object} row
 * @param {object} business summary fields from parent
 * @param {number|null} [distanceM]
 * @returns {import('../contract.js').ProductSummary|null}
 */
export function mapProductSummaryNested(row, business, distanceM) {
  if (!row || row.is_active === false) return null;

  const images = bySortOrder(row.product_images).map(mapImage).filter(Boolean);
  const categorySlug =
    row.categories?.slug
    ?? row.category_slug
    ?? business.categorySlug
    ?? '';

  return {
    id: String(row.id),
    name: String(row.name),
    price: paiseToRupees(row.price_paise),
    imageUrl: images[0]?.url ?? null,
    categorySlug: String(categorySlug),
    availableToday: Boolean(row.available_today),
    businessId: String(business.id),
    businessSlug: String(business.slug),
    businessName: String(business.name),
    businessLogoUrl: business.logoUrl ?? null,
    businessRating: Number(business.rating ?? 0),
    locality: String(business.locality ?? ''),
    distanceM: mapDistanceM(row, distanceM),
    createdAt: String(row.created_at ?? ''),
  };
}

/**
 * @param {object} row businesses nested select
 * @param {number|null} [distanceM]
 * @returns {import('../contract.js').BusinessDetail}
 */
export function mapBusinessDetail(row, distanceM) {
  const summary = mapBusinessSummary(row, distanceM);
  const images = bySortOrder(row.business_images).map(mapImage).filter(Boolean);
  const videos = bySortOrder(row.business_videos).map(mapVideo).filter(Boolean);
  const products = bySortOrder(row.products)
    .map((p) => mapProductSummaryNested(p, summary, summary.distanceM))
    .filter(Boolean);

  return {
    ...summary,
    description: String(row.description ?? ''),
    addressText: String(row.address_text ?? ''),
    images,
    videos,
    products,
  };
}

/**
 * @param {object} row products nested select with businesses(...)
 * @param {number|null} [distanceM]
 * @returns {import('../contract.js').ProductDetail|null}
 */
export function mapProductDetail(row, distanceM) {
  if (!row || row.is_active === false) return null;
  const biz = row.businesses;
  if (!biz) return null;

  const rowDistanceM = mapDistanceM(row, undefined);
  const business = mapBusinessSummary(biz, rowDistanceM ?? distanceM);
  const resolvedDistanceM = rowDistanceM ?? business.distanceM;
  const images = bySortOrder(row.product_images).map(mapImage).filter(Boolean);
  const categorySlug =
    row.categories?.slug
    ?? row.category_slug
    ?? business.categorySlug
    ?? '';

  return {
    id: String(row.id),
    name: String(row.name),
    price: paiseToRupees(row.price_paise),
    imageUrl: images[0]?.url ?? null,
    categorySlug: String(categorySlug),
    availableToday: Boolean(row.available_today),
    businessId: String(business.id),
    businessSlug: String(business.slug),
    businessName: String(business.name),
    businessLogoUrl: business.logoUrl ?? null,
    businessRating: Number(business.rating ?? 0),
    locality: String(business.locality ?? ''),
    distanceM: resolvedDistanceM,
    createdAt: String(row.created_at ?? ''),
    description: String(row.description ?? ''),
    images,
    details: mapDetails(row.details),
    business,
  };
}

/**
 * @param {object} row
 * @param {string|null|undefined} currentUserId
 * @returns {import('../contract.js').Review}
 */
export function mapReview(row, currentUserId = null) {
  return {
    id: String(row.id),
    businessId: String(row.business_id),
    reviewerName: String(row.reviewer_name ?? 'Tibu user'),
    rating: Number(row.rating),
    body: String(row.body ?? ''),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
    isMine: Boolean(currentUserId && row.user_id === currentUserId),
  };
}
