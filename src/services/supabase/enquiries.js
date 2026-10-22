/**
 * Enquiries adapter — CONTRACT §6, §7 (DECISIONS D20, D34).
 *
 * Implements non-real-time customer-seller enquiries:
 * - sendEnquiry({ businessId, productId, body })
 * - findMyThread(businessId)
 * - listMyThreads({ as })
 * - getThread(threadId, { as })
 * - sendMessage({ threadId, body })
 * - markThreadRead(threadId)
 */

import { AppError } from '../errors.js';
import { getSupabase } from './client.js';
import { mapSupabaseError } from './errors.js';
import { mapEnquiryMessage, mapEnquiryThread } from './mappers.js';

const MIN_BODY_LENGTH = 1;
const MAX_BODY_LENGTH = 2000;

/**
 * Validates enquiry message body (CONTRACT §12: 1–2000 chars after trim).
 *
 * @param {string|null|undefined} body
 * @returns {string} trimmed body
 * @throws {AppError} validation error
 */
export function validateEnquiryBody(body) {
  if (typeof body !== 'string') {
    throw new AppError('validation', 'Message must be between 1 and 2000 characters');
  }
  const trimmed = body.trim();
  if (trimmed.length < MIN_BODY_LENGTH || trimmed.length > MAX_BODY_LENGTH) {
    throw new AppError('validation', 'Message must be between 1 and 2000 characters');
  }
  return trimmed;
}

/**
 * Customer sends a new enquiry or a follow-up message on their existing thread.
 * Creates or reuses the unique thread for (customer, business). Rate-limited 20/hour.
 *
 * @param {{ businessId: string, productId?: string|null, body: string }} params
 * @returns {Promise<string>} threadId
 */
export async function sendEnquiry({ businessId, productId = null, body }) {
  if (!businessId) {
    throw new AppError('validation', 'Business ID is required');
  }
  const trimmedBody = validateEnquiryBody(body);

  const { data, error } = await getSupabase().rpc('send_enquiry', {
    p_business: businessId,
    p_body: trimmedBody,
    p_product: productId ?? null,
  });

  if (error) throw mapSupabaseError(error);
  return String(data);
}

/**
 * Check if the current authenticated customer already has a thread with the business.
 *
 * @param {string} businessId
 * @returns {Promise<string|null>} threadId or null if none
 */
export async function findMyThread(businessId) {
  if (!businessId) return null;

  const {
    data: { session },
  } = await getSupabase().auth.getSession();
  const uid = session?.user?.id;
  if (!uid) {
    throw new AppError('auth_required', 'Login required');
  }

  const { data, error } = await getSupabase()
    .from('enquiries')
    .select('id')
    .eq('business_id', businessId)
    .eq('customer_id', uid)
    .maybeSingle();

  if (error) throw mapSupabaseError(error);
  return data?.id ? String(data.id) : null;
}

/**
 * List enquiry threads for the current user in either role ('customer' or 'seller').
 *
 * @param {{ as?: 'customer'|'seller' }} [params]
 * @returns {Promise<import('../contract.js').EnquiryThread[]>}
 */
export async function listMyThreads({ as = 'customer' } = {}) {
  const { data, error } = await getSupabase().rpc('my_enquiries', {
    p_as: as,
  });

  if (error) throw mapSupabaseError(error);
  return (data ?? []).map(mapEnquiryThread);
}

/**
 * Load full thread detail and ordered messages.
 * Sellers cannot read customer profiles directly under RLS, so `customerName`
 * comes from the matching `my_enquiries` RPC row.
 * Returns null if the thread does not exist or viewer is not a participant.
 *
 * @param {string} threadId
 * @param {{ as?: 'customer'|'seller' }} [options]
 * @returns {Promise<import('../contract.js').ThreadDetail|null>}
 */
export async function getThread(threadId, { as } = {}) {
  if (!threadId) return null;

  const {
    data: { session },
  } = await getSupabase().auth.getSession();
  const uid = session?.user?.id;
  if (!uid) {
    throw new AppError('auth_required', 'Login required');
  }

  // Determine which role(s) to fetch from my_enquiries to resolve customerName
  const rolesToTry = as ? [as] : ['customer', 'seller'];

  const [threadRes, messagesRes, ...myEnquiriesResults] = await Promise.all([
    getSupabase()
      .from('enquiries')
      .select('id, status, product_id, businesses ( id, slug, name, logo_url ), products ( id, name )')
      .eq('id', threadId)
      .maybeSingle(),
    getSupabase()
      .from('enquiry_messages')
      .select('*')
      .eq('enquiry_id', threadId)
      .order('created_at', { ascending: true }),
    ...rolesToTry.map((role) => getSupabase().rpc('my_enquiries', { p_as: role })),
  ]);

  if (threadRes.error) throw mapSupabaseError(threadRes.error);
  if (messagesRes.error) throw mapSupabaseError(messagesRes.error);

  const threadRow = threadRes.data;
  if (!threadRow) return null;

  // Find thread metadata in my_enquiries output (where customer_name is populated via security definer)
  let matchingRow = null;
  for (const rpcRes of myEnquiriesResults) {
    if (rpcRes?.data && Array.isArray(rpcRes.data)) {
      const match = rpcRes.data.find((r) => String(r.enquiry_id) === String(threadId));
      if (match) {
        matchingRow = match;
        break;
      }
    }
  }

  const messages = (messagesRes.data ?? []).map((m) => mapEnquiryMessage(m, uid));
  const customerName = matchingRow?.customer_name ?? 'Customer';
  const unreadCount = Number(matchingRow?.unread ?? 0);

  const lastMessageAt =
    matchingRow?.last_message_at
    ?? (messages.length > 0 ? messages[messages.length - 1].createdAt : '');
  const lastMessagePreview = matchingRow
    ? String(matchingRow.last_message ?? '').slice(0, 80)
    : (messages.length > 0 ? messages[messages.length - 1].body.slice(0, 80) : '');

  return {
    thread: {
      id: String(threadRow.id),
      businessId: String(threadRow.businesses?.id ?? ''),
      businessName: String(threadRow.businesses?.name ?? ''),
      businessSlug: String(threadRow.businesses?.slug ?? ''),
      businessLogoUrl: threadRow.businesses?.logo_url ?? null,
      customerName,
      productId: threadRow.product_id ? String(threadRow.product_id) : null,
      productName: threadRow.products?.name ?? null,
      status: threadRow.status,
      lastMessageAt: String(lastMessageAt ?? ''),
      lastMessagePreview,
      unreadCount,
    },
    messages,
  };
}

/**
 * Send an enquiry message on an existing thread (used by sellers to reply under RLS;
 * customers use sendEnquiry for every message so the rate limit applies).
 *
 * @param {{ threadId: string, body: string }} params
 * @returns {Promise<import('../contract.js').EnquiryMessage>}
 */
export async function sendMessage({ threadId, body }) {
  if (!threadId) {
    throw new AppError('validation', 'Thread ID is required');
  }
  const trimmedBody = validateEnquiryBody(body);

  const {
    data: { session },
  } = await getSupabase().auth.getSession();
  const uid = session?.user?.id;
  if (!uid) {
    throw new AppError('auth_required', 'Login required');
  }

  const { data, error } = await getSupabase()
    .from('enquiry_messages')
    .insert({
      enquiry_id: threadId,
      sender_id: uid,
      body: trimmedBody,
    })
    .select()
    .single();

  if (error) throw mapSupabaseError(error);
  return mapEnquiryMessage(data, uid);
}

/**
 * Mark all messages in a thread as read for the current user and clear notifications.
 *
 * @param {string} threadId
 * @returns {Promise<void>}
 */
export async function markThreadRead(threadId) {
  if (!threadId) {
    throw new AppError('validation', 'Thread ID is required');
  }

  const { error } = await getSupabase().rpc('mark_enquiry_read', {
    p_enquiry: threadId,
  });

  if (error) throw mapSupabaseError(error);
}
