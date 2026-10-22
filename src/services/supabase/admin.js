/**
 * Admin adapter — CONTRACT §6, §7.
 * All three functions require an active admin session; the DB RPCs and RLS
 * enforce is_admin() independently — any non-admin call returns `forbidden`.
 */

import { AppError } from '../errors.js';
import { getSupabase } from './client.js';
import { mapSupabaseError } from './errors.js';
import {
  bySortOrder,
  mapAdminContactInfo,
  mapApplicationRow,
  mapBusinessDetail,
} from './mappers.js';
import { mapMyProduct } from './seller.js';

// ---------------------------------------------------------------------------
// Internal select strings
// ---------------------------------------------------------------------------

/** Full business select that an admin RLS session can read at any status. */
const ADMIN_PRODUCT_EMBED = `
  id, name, price_paise, description, details, available_today, is_active, created_at,
  sort_order, category_id, delivery_available, pickup_available, delivery_time,
  product_images ( id, url, sort_order ),
  categories ( slug, name )
`;

const ADMIN_BUSINESS_SELECT = `
  *,
  categories ( slug, name ),
  business_contacts ( phone, whatsapp ),
  business_images ( id, url, sort_order ),
  business_videos ( id, instagram_url, shortcode, caption, sort_order ),
  products ( ${ADMIN_PRODUCT_EMBED} )
`;

// ---------------------------------------------------------------------------
// Pure helper — exported only so the test file can import it without Supabase
// ---------------------------------------------------------------------------

/**
 * Allowed status-machine transitions (CONTRACT §7, mirrors admin_set_business_status SQL):
 *   pending  → approved | rejected
 *   approved → unpublished
 *   unpublished → approved   (action = republish)
 *   rejected    → approved   (action = republish)
 *
 * @param {string} currentStatus
 * @param {'approve'|'reject'|'unpublish'|'republish'} action
 * @param {string|null|undefined} reason
 * @throws {AppError} 'conflict' for invalid transition, 'validation' for missing reason
 */
export function validateTransition(currentStatus, action, reason) {
  const allowed = {
    pending: ['approve', 'reject'],
    approved: ['unpublish'],
    unpublished: ['republish'],
    rejected: ['republish'],
  };

  const permitted = allowed[currentStatus] ?? [];
  if (!permitted.includes(action)) {
    throw new AppError(
      'conflict',
      "That action isn't possible in the current status",
    );
  }

  const requiresReason = action === 'reject' || action === 'unpublish';
  if (requiresReason && !reason?.trim()) {
    throw new AppError('validation', 'Add a reason');
  }
}

/**
 * Map action → the business_status value the RPC expects.
 * approve / republish both set status = 'approved'.
 *
 * @param {'approve'|'reject'|'unpublish'|'republish'} action
 * @returns {string}
 */
function actionToStatus(action) {
  if (action === 'approve' || action === 'republish') return 'approved';
  if (action === 'reject') return 'rejected';
  return 'unpublished'; // action === 'unpublish'
}

// ---------------------------------------------------------------------------
// mapAdminBusiness — turns the full table row into MyBusiness (admin flavour)
// ---------------------------------------------------------------------------

/**
 * @param {object} row full businesses row with admin embeds
 * @returns {import('../contract.js').MyBusiness}
 */
function mapAdminBusiness(row) {
  // mapBusinessDetail filters products to is_active; admin sees all → pass empty,
  // then build products separately with includeInactive.
  const detail = mapBusinessDetail({ ...row, products: [] });
  const products = bySortOrder(row.products ?? [])
    .map((p) => mapMyProduct(p, row))
    .filter(Boolean);

  return {
    ...detail,
    status: row.status,
    rejectionReason: row.rejection_reason ?? null,
    submittedAt: row.submitted_at ? String(row.submitted_at) : null,
    instagramHandle: row.instagram_handle ?? null,
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    contacts: mapAdminContactInfo(row.business_contacts),
    products,
  };
}

// ---------------------------------------------------------------------------
// mapAdminHistory — admin_actions rows with joined profile
// ---------------------------------------------------------------------------

/**
 * @param {object[]} rows admin_actions rows with profiles!admin_id embed
 * @returns {import('../contract.js').ApplicationDetail['history']}
 */
function mapAdminHistory(rows) {
  return (rows ?? []).map((r) => ({
    action: r.action,
    reason: r.reason ?? null,
    adminName: r.profiles?.full_name ?? null,
    createdAt: String(r.created_at ?? ''),
  }));
}

// ---------------------------------------------------------------------------
// Exported service functions
// ---------------------------------------------------------------------------

/**
 * List businesses visible to admin, optionally filtered by status.
 * Calls admin_list_businesses(p_status); null = all statuses.
 *
 * @param {{ status?: string|null }} [opts]
 * @returns {Promise<import('../contract.js').ApplicationRow[]>}
 */
export async function listApplications({ status } = {}) {
  const sb = getSupabase();
  try {
    const { data, error } = await sb.rpc('admin_list_businesses', {
      p_status: status ?? null,
    });
    if (error) throw error;
    return (data ?? []).map(mapApplicationRow);
  } catch (err) {
    throw mapSupabaseError(err);
  }
}

/**
 * Full application detail for a single business.
 * Returns null when the business does not exist.
 *
 * @param {string} businessId
 * @returns {Promise<import('../contract.js').ApplicationDetail|null>}
 */
export async function getApplication(businessId) {
  const sb = getSupabase();
  try {
    // 1. Full business row (admin RLS allows any status)
    const [bizResult, listResult, histResult] = await Promise.all([
      sb
        .from('businesses')
        .select(ADMIN_BUSINESS_SELECT)
        .eq('id', businessId)
        .single(),

      // 2. ApplicationRow (owner email / phone / whatsapp live only in this RPC)
      sb.rpc('admin_list_businesses', { p_status: null }),

      // 3. Admin action history with the admin's name (profiles RLS allows admin to read any profile)
      sb
        .from('admin_actions')
        .select('action, reason, created_at, profiles!admin_id ( full_name )')
        .eq('business_id', businessId)
        .order('created_at', { ascending: true }),
    ]);

    // Not found (PGRST116 = .single() found 0 rows)
    if (bizResult.error?.code === 'PGRST116' || bizResult.data == null) {
      return null;
    }
    if (bizResult.error) throw bizResult.error;
    if (listResult.error) throw listResult.error;
    if (histResult.error) throw histResult.error;

    const rawRow = (listResult.data ?? []).find(
      (r) => String(r.id) === String(businessId),
    );
    // Business exists in table but not in RPC list (e.g. race condition) — still return detail.
    const row = rawRow
      ? mapApplicationRow(rawRow)
      : {
          businessId: String(businessId),
          name: String(bizResult.data.name ?? ''),
          slug: String(bizResult.data.slug ?? ''),
          status: bizResult.data.status,
          categoryName: null,
          ownerName: null,
          ownerEmail: '',
          phone: null,
          whatsapp: null,
          instagramHandle: bizResult.data.instagram_handle ?? null,
          locality: bizResult.data.locality ?? null,
          submittedAt: bizResult.data.submitted_at
            ? String(bizResult.data.submitted_at)
            : null,
          productCount: (bizResult.data.products ?? []).length,
        };

    return {
      business: mapAdminBusiness(bizResult.data),
      row,
      history: mapAdminHistory(histResult.data),
    };
  } catch (err) {
    throw mapSupabaseError(err);
  }
}

/**
 * Approve, reject, unpublish, or republish a business.
 * Validates the transition client-side (fast fail) before calling the RPC.
 *
 * @param {{ businessId: string, action: 'approve'|'reject'|'unpublish'|'republish', reason?: string|null }} opts
 * @returns {Promise<void>}
 */
export async function decideApplication({ businessId, action, reason }) {
  const sb = getSupabase();

  // 1. Fetch current status to validate the transition before the RPC call.
  let currentStatus;
  try {
    const { data, error } = await sb
      .from('businesses')
      .select('status')
      .eq('id', businessId)
      .single();
    if (error) throw error;
    currentStatus = data.status;
  } catch (err) {
    throw mapSupabaseError(err);
  }

  // 2. Client-side transition guard (throws AppError directly — no need to map).
  validateTransition(currentStatus, action, reason);

  // 3. Call the RPC.
  const pStatus = actionToStatus(action);
  try {
    const { error } = await sb.rpc('admin_set_business_status', {
      p_business: businessId,
      p_status: pStatus,
      p_reason: reason ?? null,
    });
    if (error) throw error;
  } catch (err) {
    throw mapSupabaseError(err);
  }
}
