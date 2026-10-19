/**
 * Seller adapter — CONTRACT §5 / §7. Uploads are A4.2 (still stubs on the index).
 */

import { parseInstagramShortcode } from '../../lib/instagram.js';
import { roundCoord } from '../../lib/geo.js';
import { normalizeIndianMobile } from '../../lib/whatsapp.js';
import { AppError } from '../errors.js';
import { getSession } from './auth.js';
import { getSupabase } from './client.js';
import { detailsToDb } from './details.js';
import { mapSupabaseError } from './errors.js';
import { getMe } from './me.js';
import {
  bySortOrder,
  mapBusinessDetail,
  mapProductDetail,
  mapVideo,
  rupeesToPaise,
} from './mappers.js';

const INVALID_REEL = "That doesn't look like a public Instagram reel link";

const MY_PRODUCT_EMBED = `
  id, name, price_paise, description, details, available_today, is_active, created_at,
  sort_order, category_id, delivery_available, pickup_available, delivery_time,
  product_images ( id, url, sort_order ),
  categories ( slug, name )
`;

const MY_BUSINESS_SELECT = `
  *,
  categories ( slug, name ),
  business_contacts ( phone, whatsapp ),
  business_images ( id, url, sort_order ),
  business_videos ( id, instagram_url, shortcode, caption, sort_order ),
  products ( ${MY_PRODUCT_EMBED} )
`;

/** B4.2 onboarding step numbers. Keys match submit_business_for_review plus D29 product_image. */
export const SUBMIT_CHECKLIST_ITEMS = [
  { key: 'category', label: 'Category', step: 1 },
  { key: 'description', label: 'Description', step: 1 },
  { key: 'location', label: 'Location', step: 2 },
  { key: 'contacts', label: 'Phone & WhatsApp', step: 3 },
  { key: 'instagram_handle', label: 'Instagram handle', step: 3 },
  { key: 'logo', label: 'Logo', step: 4 },
  { key: 'at_least_one_product', label: 'At least one product', step: 5 },
  { key: 'product_image', label: 'Product photo', step: 5 },
];

const CHECKLIST_BY_KEY = Object.fromEntries(SUBMIT_CHECKLIST_ITEMS.map((item) => [item.key, item]));

/** @param {string} [name] */
export function slugifyName(name) {
  const slug = String(name ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'shop';
}

export function randomSlugSuffix() {
  return Math.floor(Math.random() * 36 ** 4).toString(36).padStart(4, '0');
}

/** @param {string} name @param {string} [suffix] */
export function generateBusinessSlug(name, suffix = randomSlugSuffix()) {
  return `${slugifyName(name)}-${suffix}`;
}

/**
 * @param {string|null|undefined} raw
 * @returns {string|null}
 */
export function toDeliveryTime(raw) {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * @param {unknown} value
 * @returns {number|null}
 */
export function toEstablishedYear(value) {
  if (value == null || value === '') return null;
  const year = Number(value);
  const current = new Date().getFullYear();
  if (!Number.isInteger(year) || year < 1900 || year > current) {
    throw new AppError('validation', `Enter a year between 1900 and ${current}`);
  }
  return year;
}

/**
 * @param {import('../contract.js').DeliveryOverride|null|undefined} override
 * @returns {{ delivery_available: boolean|null, pickup_available: boolean|null, delivery_time: string|null }}
 */
export function deliveryOverrideToColumns(override) {
  if (override == null) {
    return {
      delivery_available: null,
      pickup_available: null,
      delivery_time: null,
    };
  }
  return {
    delivery_available: override.deliveryAvailable,
    pickup_available: override.pickupAvailable,
    delivery_time: toDeliveryTime(override.deliveryTime),
  };
}

/**
 * @param {object} productRow
 * @param {object} businessRow
 * @returns {import('../contract.js').DeliveryOverride|null}
 */
export function mapDeliveryOverride(productRow, businessRow) {
  if (
    productRow.delivery_available == null
    && productRow.pickup_available == null
    && productRow.delivery_time == null
  ) {
    return null;
  }
  return {
    deliveryAvailable: Boolean(productRow.delivery_available ?? businessRow.delivery_available),
    pickupAvailable: Boolean(productRow.pickup_available ?? businessRow.pickup_available),
    deliveryTime: productRow.delivery_time ?? null,
  };
}

/**
 * @param {object} productRow
 * @param {object} businessRow
 * @returns {import('../contract.js').MyProduct|null}
 */
export function mapMyProduct(productRow, businessRow) {
  const detail = mapProductDetail(
    { ...productRow, businesses: businessRow },
    null,
    { includeInactive: true },
  );
  if (!detail) return null;
  return {
    ...detail,
    isActive: Boolean(productRow.is_active),
    sortOrder: Number(productRow.sort_order ?? 0),
    deliveryOverride: mapDeliveryOverride(productRow, businessRow),
  };
}

function mapContactInfo(raw) {
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row) return null;
  return { phone: row.phone ?? null, whatsapp: row.whatsapp ?? null };
}

/**
 * @param {object} row
 * @returns {import('../contract.js').MyBusiness}
 */
export function mapMyBusiness(row) {
  const detail = mapBusinessDetail({ ...row, products: [] });
  return {
    ...detail,
    status: row.status,
    rejectionReason: row.rejection_reason ?? null,
    submittedAt: row.submitted_at ?? null,
    instagramHandle: row.instagram_handle ?? null,
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    contacts: mapContactInfo(row.business_contacts),
    products: bySortOrder(row.products).map((p) => mapMyProduct(p, row)).filter(Boolean),
  };
}

/**
 * Checklist from a businesses row (with nested products / contacts), mirroring
 * submit_business_for_review plus D29 product_image.
 * @param {object|null} row
 * @returns {import('../contract.js').SubmitChecklist}
 */
export function buildSubmitChecklist(row) {
  if (!row) {
    return { ok: false, missing: SUBMIT_CHECKLIST_ITEMS.map((item) => ({ ...item })) };
  }
  /** @type {Array<{ key: string, label: string, step: number }>} */
  const missing = [];
  const add = (key) => missing.push({ ...CHECKLIST_BY_KEY[key] });

  if (row.category_id == null) add('category');
  if (row.description == null) add('description');
  if (row.logo_url == null) add('logo');
  const locationMissing = Object.hasOwn(row, 'location')
    ? row.location == null
    : (row.lat == null || row.lng == null);
  if (locationMissing) add('location');
  if (row.instagram_handle == null) add('instagram_handle');
  if (!mapContactInfo(row.business_contacts)) add('contacts');

  const products = row.products ?? [];
  if (!products.some((p) => p.is_active)) add('at_least_one_product');
  if (!products.some((p) => p.is_active && (p.product_images ?? []).length > 0)) {
    add('product_image');
  }

  return { ok: missing.length === 0, missing };
}

async function requireUserId() {
  const session = await getSession();
  if (!session) throw new AppError('auth_required', 'Please log in to continue');
  return session.userId;
}

function emptyToNull(value) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

function toCoord(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? roundCoord(n) : null;
}

function normalizeInstagramHandle(raw) {
  const trimmed = emptyToNull(raw);
  if (!trimmed) return null;
  let handle = trimmed.replace(/^@/, '');
  try {
    if (/instagram\.com/i.test(handle)) {
      const url = new URL(handle.startsWith('http') ? handle : `https://${handle}`);
      const parts = url.pathname.split('/').filter(Boolean);
      handle = parts[0] ?? '';
    }
  } catch {
    // keep the stripped string
  }
  if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) {
    throw new AppError('validation', "That Instagram handle isn't valid");
  }
  return handle;
}

function tenDigitContact(raw, label) {
  const digits = normalizeIndianMobile(raw)?.slice(2) ?? null;
  if (!digits) throw new AppError('validation', `Enter a valid 10-digit ${label} number`);
  return digits;
}

async function categoryIdForSlug(slug) {
  const value = emptyToNull(slug);
  if (!value) return null;
  const { data, error } = await getSupabase()
    .from('categories')
    .select('id')
    .eq('slug', value)
    .maybeSingle();
  if (error) throw mapSupabaseError(error);
  if (!data) throw new AppError('validation', "That value isn't valid");
  return data.id;
}

async function toBusinessColumns(input) {
  return {
    name: String(input.name ?? '').trim(),
    description: emptyToNull(input.description),
    category_id: await categoryIdForSlug(input.categorySlug),
    address_text: emptyToNull(input.addressText),
    locality: emptyToNull(input.locality),
    city: emptyToNull(input.city) ?? 'Mumbai',
    lat: toCoord(input.lat),
    lng: toCoord(input.lng),
    instagram_handle: normalizeInstagramHandle(input.instagramHandle),
    delivery_available: Boolean(input.deliveryAvailable),
    pickup_available: Boolean(input.pickupAvailable),
    delivery_time: toDeliveryTime(input.deliveryTime),
    established_year: toEstablishedYear(input.establishedYear),
  };
}

function isSlugConflict(error) {
  return error?.code === '23505';
}

async function fetchMyBusinessRow(userId) {
  const { data, error } = await getSupabase()
    .from('businesses')
    .select(MY_BUSINESS_SELECT)
    .eq('owner_id', userId)
    .maybeSingle();
  if (error) throw mapSupabaseError(error);
  return data;
}

async function fetchProductRow(id) {
  const { data, error } = await getSupabase()
    .from('products')
    .select(`${MY_PRODUCT_EMBED}, businesses ( * , categories ( slug, name ) )`)
    .eq('id', id)
    .maybeSingle();
  if (error) throw mapSupabaseError(error);
  if (!data?.businesses) return null;
  return mapMyProduct(data, data.businesses);
}

/** @returns {Promise<import('../contract.js').Profile>} */
export async function becomeSeller() {
  const { error } = await getSupabase().rpc('become_seller');
  if (error) throw mapSupabaseError(error);
  const me = await getMe();
  if (!me) throw new AppError('not_found', "We couldn't find that");
  return me;
}

/** @returns {Promise<import('../contract.js').MyBusiness|null>} */
export async function getMyBusiness() {
  const uid = await requireUserId();
  const row = await fetchMyBusinessRow(uid);
  return row ? mapMyBusiness(row) : null;
}

/** @param {import('../contract.js').BusinessInput} input */
export async function saveMyBusiness(input) {
  const uid = await requireUserId();
  const columns = await toBusinessColumns(input);
  const existing = await fetchMyBusinessRow(uid);

  if (!existing) {
    const payload = { ...columns, owner_id: uid, slug: generateBusinessSlug(columns.name) };
    let { error } = await getSupabase()
      .from('businesses')
      .insert(payload);
    if (error && isSlugConflict(error)) {
      const retry = { ...payload, slug: generateBusinessSlug(columns.name) };
      ({ error } = await getSupabase().from('businesses').insert(retry));
    }
    if (error) throw mapSupabaseError(error);
    return getMyBusiness();
  }

  const { error } = await getSupabase()
    .from('businesses')
    .update(columns)
    .eq('id', existing.id);
  if (error) throw mapSupabaseError(error);
  return getMyBusiness();
}

/** @param {{ phone: string, whatsapp: string }} input */
export async function saveMyContacts({ phone, whatsapp }) {
  const uid = await requireUserId();
  const business = await fetchMyBusinessRow(uid);
  if (!business) throw new AppError('not_found', "We couldn't find that");
  const row = {
    business_id: business.id,
    phone: tenDigitContact(phone, 'phone'),
    whatsapp: tenDigitContact(whatsapp, 'WhatsApp'),
  };
  const { data, error } = await getSupabase()
    .from('business_contacts')
    .upsert(row, { onConflict: 'business_id' })
    .select('phone, whatsapp')
    .single();
  if (error) throw mapSupabaseError(error);
  return { phone: data.phone, whatsapp: data.whatsapp };
}

/** @returns {Promise<import('../contract.js').MyProduct[]>} */
export async function listMyProducts() {
  const business = await getMyBusiness();
  return business?.products ?? [];
}

/** @param {import('../contract.js').ProductInput} input */
export async function saveProduct(input) {
  const uid = await requireUserId();
  const business = await fetchMyBusinessRow(uid);
  if (!business) throw new AppError('not_found', "We couldn't find that");

  const payload = {
    name: String(input.name ?? '').trim(),
    price_paise: rupeesToPaise(input.price),
    description: emptyToNull(input.description),
    details: detailsToDb(input.details),
    category_id: await categoryIdForSlug(input.categorySlug),
    available_today: Boolean(input.availableToday),
    is_active: input.isActive !== false,
    ...deliveryOverrideToColumns(input.deliveryOverride),
  };

  let id = input.id ?? null;
  if (id) {
    const { error } = await getSupabase()
      .from('products')
      .update(payload)
      .eq('id', id);
    if (error) throw mapSupabaseError(error);
  } else {
    const { data, error } = await getSupabase()
      .from('products')
      .insert({ ...payload, business_id: business.id })
      .select('id')
      .single();
    if (error) throw mapSupabaseError(error);
    id = data.id;
  }

  const mapped = await fetchProductRow(id);
  if (!mapped) throw new AppError('not_found', "We couldn't find that");
  return mapped;
}

/** @param {string} id */
export async function deleteProduct(id) {
  const { error } = await getSupabase().from('products').delete().eq('id', id);
  if (error) throw mapSupabaseError(error);
}

/** @param {{ instagramUrl: string, caption?: string }} input */
export async function addVideo({ instagramUrl, caption }) {
  const uid = await requireUserId();
  const business = await fetchMyBusinessRow(uid);
  if (!business) throw new AppError('not_found', "We couldn't find that");
  const shortcode = parseInstagramShortcode(instagramUrl);
  if (!shortcode) throw new AppError('validation', INVALID_REEL);
  const trimmedCaption = emptyToNull(caption);
  if (trimmedCaption && trimmedCaption.length > 200) {
    throw new AppError('validation', 'Keep the caption to 200 characters');
  }
  const { data, error } = await getSupabase()
    .from('business_videos')
    .insert({
      business_id: business.id,
      instagram_url: String(instagramUrl).trim(),
      shortcode,
      caption: trimmedCaption,
    })
    .select('id, instagram_url, shortcode, caption')
    .single();
  if (error) throw mapSupabaseError(error);
  return mapVideo(data);
}

/** @param {string} id */
export async function removeVideo(id) {
  const { error } = await getSupabase().from('business_videos').delete().eq('id', id);
  if (error) throw mapSupabaseError(error);
}

/** @returns {Promise<import('../contract.js').SubmitChecklist>} */
export async function getSubmitChecklist() {
  const uid = await requireUserId();
  const row = await fetchMyBusinessRow(uid);
  return buildSubmitChecklist(row);
}

/** @returns {Promise<import('../contract.js').MyBusiness>} */
export async function submitForReview() {
  const { error } = await getSupabase().rpc('submit_business_for_review');
  if (error) throw mapSupabaseError(error);
  const business = await getMyBusiness();
  if (!business) throw new AppError('not_found', "We couldn't find that");
  return business;
}

/** @param {{ kind: 'business'|'product', id: string, value: boolean }} input */
export async function setAvailableToday({ kind, id, value }) {
  const table = kind === 'business' ? 'businesses' : kind === 'product' ? 'products' : null;
  if (!table) throw new AppError('validation', "That value isn't valid");
  const { error } = await getSupabase()
    .from(table)
    .update({ available_today: Boolean(value) })
    .eq('id', id);
  if (error) throw mapSupabaseError(error);
}

/** @returns {Promise<import('../contract.js').SellerStats>} */
export async function getMyStats() {
  const { data, error } = await getSupabase().rpc('my_business_stats');
  if (error) throw mapSupabaseError(error);
  const row = Array.isArray(data) ? data[0] : data;
  return {
    contacts7d: Number(row?.contacts_7d ?? 0),
    contacts30d: Number(row?.contacts_30d ?? 0),
    whatsapp30d: Number(row?.whatsapp_30d ?? 0),
    calls30d: Number(row?.calls_30d ?? 0),
    saves: Number(row?.saves ?? 0),
    openEnquiries: Number(row?.open_enquiries ?? 0),
    rating: Number(row?.rating_avg ?? 0),
    reviewCount: Number(row?.rating_count ?? 0),
  };
}
