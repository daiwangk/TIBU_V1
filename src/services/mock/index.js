import { AppError } from '../errors.js';
import { calculateDistance } from '../../utils/distance.js';
import { businesses, products, reviews } from './fixtures.js';
import { CATEGORIES, descendantSlugs, getCategoryRecord } from './taxonomy.js';

const DELAY_MS = 150;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const DEFAULT_RADIUS_KM = 15;

const delay = () => new Promise((r) => setTimeout(r, DELAY_MS));

const unavailable = async () => {
  throw new AppError('unavailable_in_mock', 'Needs the real backend');
};

/**
 * @param {object} row
 * @param {number|null} [distanceM]
 */
function copyBusinessSummary(row, distanceM = null) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: row.categorySlug,
    categoryName: row.categoryName,
    logoUrl: row.logoUrl,
    bannerUrl: row.bannerUrl,
    locality: row.locality,
    city: row.city,
    distanceM,
    rating: row.rating,
    reviewCount: row.reviewCount,
    availableToday: row.availableToday,
    deliveryAvailable: row.deliveryAvailable,
    pickupAvailable: row.pickupAvailable,
    approvedAt: row.approvedAt,
  };
}

/**
 * @param {object} row
 * @param {number|null} [distanceM]
 */
function copyProductSummary(row, distanceM = null) {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    imageUrl: row.imageUrl,
    categorySlug: row.categorySlug,
    availableToday: row.availableToday,
    businessId: row.businessId,
    businessSlug: row.businessSlug,
    businessName: row.businessName,
    businessLogoUrl: row.businessLogoUrl,
    businessRating: row.businessRating,
    locality: row.locality,
    distanceM,
    createdAt: row.createdAt,
  };
}

/**
 * @param {{ lat: number, lng: number }|null|undefined} near
 * @param {number} lat
 * @param {number} lng
 * @returns {number|null}
 */
function distanceTo(near, lat, lng) {
  if (!near) return null;
  return calculateDistance(near.lat, near.lng, lat, lng);
}

/**
 * @param {import('../contract.js').SearchParams} [params]
 */
function normalizePaging(params = {}) {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = params.offset ?? 0;
  return { limit, offset };
}

/**
 * Default: distance when near set, else newest. Unknown sort → newest.
 * @param {string|undefined} sort
 * @param {boolean} hasNear
 * @param {'business'|'product'} kind
 */
function resolveSort(sort, hasNear, kind) {
  const businessOk = new Set(['distance', 'newest', 'rating']);
  const productOk = new Set(['distance', 'newest', 'price_asc', 'price_desc']);
  const allowed = kind === 'business' ? businessOk : productOk;
  if (sort && allowed.has(sort)) return sort;
  if (sort) return 'newest';
  return hasNear ? 'distance' : 'newest';
}

/**
 * @param {Array<{ row: object, distanceM: number|null }>} items
 * @param {string} sort
 */
function sortItems(items, sort) {
  const copy = items.slice();
  if (sort === 'distance') {
    copy.sort((a, b) => (a.distanceM ?? Infinity) - (b.distanceM ?? Infinity));
  } else if (sort === 'newest') {
    copy.sort((a, b) => {
      const ta = a.row.approvedAt || a.row.createdAt || '';
      const tb = b.row.approvedAt || b.row.createdAt || '';
      return tb.localeCompare(ta);
    });
  } else if (sort === 'rating') {
    copy.sort(
      (a, b) =>
        b.row.rating - a.row.rating || b.row.reviewCount - a.row.reviewCount,
    );
  } else if (sort === 'price_asc') {
    copy.sort((a, b) => a.row.price - b.row.price);
  } else if (sort === 'price_desc') {
    copy.sort((a, b) => b.row.price - a.row.price);
  }
  return copy;
}

function matchesQ(haystacks, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return haystacks.some((h) => h && String(h).toLowerCase().includes(needle));
}

/**
 * @param {import('../contract.js').SearchParams} [params]
 * @param {boolean} hasNear
 */
function resolveRadiusM(params, hasNear) {
  if (!hasNear) return null;
  if (params.radiusKm === null) return null; // no limit
  if (params.radiusKm === undefined) return DEFAULT_RADIUS_KM * 1000;
  return params.radiusKm * 1000;
}

export async function listCategories() {
  await delay();
  return CATEGORIES.map((c) => ({ ...c }));
}

/** @param {string} slug */
export async function getCategory(slug) {
  await delay();
  const c = getCategoryRecord(slug);
  return c ? { ...c } : null;
}

/** @param {import('../contract.js').SearchParams} [params] */
export async function searchBusinesses(params = {}) {
  await delay();
  const { limit, offset } = normalizePaging(params);
  const near = params.near ?? null;
  const hasNear = !!(near && typeof near.lat === 'number' && typeof near.lng === 'number');
  const sort = resolveSort(params.sort, hasNear, 'business');
  const radiusM = resolveRadiusM(params, hasNear);
  const categorySet = params.category ? new Set(descendantSlugs(params.category)) : null;

  /** @type {Array<{ row: object, distanceM: number|null }>} */
  const filtered = [];
  for (const b of businesses) {
    if (categorySet && !categorySet.has(b.categorySlug)) continue;
    // Only `true` filters; false/undefined = no filter
    if (params.availableToday === true && !b.availableToday) continue;
    if (!matchesQ([b.name, b.description], params.q)) continue;

    const distanceM = distanceTo(hasNear ? near : null, b.lat, b.lng);
    if (hasNear && radiusM != null && (distanceM == null || distanceM > radiusM)) continue;

    filtered.push({ row: b, distanceM: hasNear ? distanceM : null });
  }

  return sortItems(filtered, sort)
    .slice(offset, offset + limit)
    .map(({ row, distanceM }) => copyBusinessSummary(row, distanceM));
}

/** @param {import('../contract.js').SearchParams} [params] */
export async function searchProducts(params = {}) {
  await delay();
  const { limit, offset } = normalizePaging(params);
  const near = params.near ?? null;
  const hasNear = !!(near && typeof near.lat === 'number' && typeof near.lng === 'number');
  const sort = resolveSort(params.sort, hasNear, 'product');
  const radiusM = resolveRadiusM(params, hasNear);
  const categorySet = params.category ? new Set(descendantSlugs(params.category)) : null;

  /** @type {Array<{ row: object, distanceM: number|null }>} */
  const filtered = [];
  for (const p of products) {
    if (categorySet && !categorySet.has(p.categorySlug)) continue;
    if (params.availableToday === true && !p.availableToday) continue;
    if (params.businessId && p.businessId !== params.businessId) continue;
    if (params.minPrice != null && p.price < params.minPrice) continue;
    if (params.maxPrice != null && p.price > params.maxPrice) continue;
    if (!matchesQ([p.name, p.description, p.businessName], params.q)) continue;

    const distanceM = distanceTo(hasNear ? near : null, p._lat, p._lng);
    if (hasNear && radiusM != null && (distanceM == null || distanceM > radiusM)) continue;

    filtered.push({ row: p, distanceM: hasNear ? distanceM : null });
  }

  return sortItems(filtered, sort)
    .slice(offset, offset + limit)
    .map(({ row, distanceM }) => copyProductSummary(row, distanceM));
}

/**
 * @param {string} slug
 * @param {{ near?: { lat: number, lng: number }|null }} [opts]
 */
export async function getBusinessBySlug(slug, opts = {}) {
  await delay();
  const b = businesses.find((x) => x.slug === slug);
  if (!b) return null;

  const near = opts.near ?? null;
  const hasNear = !!(near && typeof near.lat === 'number' && typeof near.lng === 'number');
  const distanceM = distanceTo(hasNear ? near : null, b.lat, b.lng);

  const bizProducts = products
    .filter((p) => p.businessId === b.id)
    .map((p) =>
      copyProductSummary(p, hasNear ? distanceTo(near, p._lat, p._lng) : null),
    );

  return {
    ...copyBusinessSummary(b, hasNear ? distanceM : null),
    description: b.description,
    addressText: b.addressText,
    images: b.images.map((img) => ({ ...img })),
    videos: b.videos.map((v) => ({ ...v })),
    products: bizProducts,
  };
}

/**
 * @param {string} id
 * @param {{ near?: { lat: number, lng: number }|null }} [opts]
 */
export async function getProductById(id, opts = {}) {
  await delay();
  const p = products.find((x) => x.id === id);
  if (!p) return null;

  const b = businesses.find((x) => x.id === p.businessId);
  if (!b) return null;

  const near = opts.near ?? null;
  const hasNear = !!(near && typeof near.lat === 'number' && typeof near.lng === 'number');

  return {
    ...copyProductSummary(p, hasNear ? distanceTo(near, p._lat, p._lng) : null),
    description: p.description,
    images: p.images.map((img) => ({ ...img })),
    details: p.details.map((d) => ({ ...d })),
    business: copyBusinessSummary(
      b,
      hasNear ? distanceTo(near, b.lat, b.lng) : null,
    ),
  };
}

/**
 * @param {string} businessId
 * @param {{ limit?: number, offset?: number }} [opts]
 */
export async function listReviews(businessId, opts = {}) {
  await delay();
  const limit = Math.min(opts.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = opts.offset ?? 0;
  return reviews
    .filter((r) => r.businessId === businessId)
    .slice(offset, offset + limit)
    .map((r) => ({ ...r }));
}

export const getMyReview = unavailable;
export const saveMyReview = unavailable;
export const deleteMyReview = unavailable;
export const getSession = unavailable;
export const onAuthChange = unavailable;
export const signUp = unavailable;
export const signIn = unavailable;
export const signOut = unavailable;
export const sendPasswordReset = unavailable;
export const updatePassword = unavailable;
export const getMe = unavailable;
export const updateMe = unavailable;
export const uploadAvatar = unavailable;
export const revealContact = unavailable;
export const getSavedIds = unavailable;
export const listSavedBusinesses = unavailable;
export const listSavedProducts = unavailable;
export const setSaved = unavailable;
export const trackView = unavailable;
export const listRecent = unavailable;
export const listConnected = unavailable;
export const becomeSeller = unavailable;
export const getMyBusiness = unavailable;
export const saveMyBusiness = unavailable;
export const saveMyContacts = unavailable;
export const uploadBusinessImage = unavailable;
export const removeBusinessImage = unavailable;
export const listMyProducts = unavailable;
export const saveProduct = unavailable;
export const deleteProduct = unavailable;
export const uploadProductImage = unavailable;
export const removeProductImage = unavailable;
export const addVideo = unavailable;
export const removeVideo = unavailable;
export const getSubmitChecklist = unavailable;
export const submitForReview = unavailable;
export const setAvailableToday = unavailable;
export const getMyStats = unavailable;
export const listApplications = unavailable;
export const getApplication = unavailable;
export const decideApplication = unavailable;
export const sendEnquiry = unavailable;
export const findMyThread = unavailable;
export const listMyThreads = unavailable;
export const getThread = unavailable;
export const sendMessage = unavailable;
export const markThreadRead = unavailable;
export const listNotifications = unavailable;
export const markNotificationsRead = unavailable;
export const getUnreadCounts = unavailable;
