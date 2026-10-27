/**
 * Pure helpers for the admin panel (CONTRACT §6, §7): tabs, status grouping, the allowed actions per
 * status, reason validation and the links built for verifying a seller.
 */

import { userMessage } from '../../lib/errors';

/** @typedef {import('../../services/contract.js').ApplicationRow} ApplicationRow */
/** @typedef {'pending'|'approved'|'rejected'|'unpublished'} TabStatus */

/** The list tabs, in order. Drafts have no tab: they haven't been submitted. */
export const ADMIN_TABS = [
  { status: 'pending', label: 'Pending', emptyTitle: 'No applications waiting', emptyText: 'New seller applications appear here.' },
  { status: 'approved', label: 'Approved', emptyTitle: 'No live shops yet', emptyText: 'Approved shops appear here.' },
  { status: 'rejected', label: 'Rejected', emptyTitle: 'No rejected applications', emptyText: 'Applications sent back for changes appear here.' },
  { status: 'unpublished', label: 'Unpublished', emptyTitle: 'No unpublished shops', emptyText: 'Shops taken off Tibu appear here.' },
];

const TAB_STATUSES = ADMIN_TABS.map((t) => t.status);

/** Badge text and tone for every business status. */
export const STATUS_BADGES = {
  draft: { label: 'Draft', tone: 'neutral' },
  pending: { label: 'Pending', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'neutral' },
  unpublished: { label: 'Unpublished', tone: 'neutral' },
};

/** History rows (admin_actions.action) as past-tense labels. */
export const HISTORY_LABELS = {
  approve: 'Approved',
  reject: 'Rejected',
  unpublish: 'Unpublished',
  republish: 'Republished',
};

export const REASON_MIN = 10;

/** Pre-filled text for the admin's WhatsApp link to a seller. */
export const WHATSAPP_TEXT = 'Hi, this is Tibu regarding your shop application.';

/**
 * The tab for a `?status=` value; anything unknown (or missing) is Pending.
 *
 * @param {string|null} value
 * @returns {TabStatus}
 */
export function parseStatusParam(value) {
  return TAB_STATUSES.includes(value) ? /** @type {TabStatus} */ (value) : 'pending';
}

/**
 * Splits one `listApplications({ status: null })` result into the four tabs, keeping the server's order.
 * Drafts (and any unknown status) are left out.
 *
 * @param {ApplicationRow[]} rows
 * @returns {Record<TabStatus, ApplicationRow[]>}
 */
export function groupByStatus(rows) {
  const groups = { pending: [], approved: [], rejected: [], unpublished: [] };
  for (const row of rows ?? []) {
    if (groups[row.status]) groups[row.status].push(row);
  }
  return groups;
}

/**
 * @typedef {Object} AdminAction
 * @property {'approve'|'reject'|'unpublish'|'republish'} action  sent to decideApplication
 * @property {string} label
 * @property {boolean} needsReason
 * @property {'primary'|'danger'} variant
 * @property {string} doneMessage   success toast
 */

const APPROVE = { action: 'approve', label: 'Approve', needsReason: false, variant: 'primary', doneMessage: 'Approved — the shop is live' };
const REJECT = { action: 'reject', label: 'Reject', needsReason: true, variant: 'danger', doneMessage: 'Application rejected' };
const UNPUBLISH = { action: 'unpublish', label: 'Unpublish', needsReason: true, variant: 'danger', doneMessage: 'Shop unpublished' };
const REPUBLISH = { action: 'republish', label: 'Republish', needsReason: false, variant: 'primary', doneMessage: 'Republished — the shop is live' };

/** @type {Record<string, AdminAction[]>} */
const ACTIONS_BY_STATUS = {
  pending: [APPROVE, REJECT],
  approved: [UNPUBLISH],
  unpublished: [REPUBLISH],
  // The adapter's validateTransition only accepts 'republish' for rejected (CONTRACT §7 says approve).
  rejected: [{ ...REPUBLISH, label: 'Approve', doneMessage: APPROVE.doneMessage }],
};

/**
 * What an admin can do with a business in `status` (CONTRACT §7 transitions). Drafts get nothing.
 *
 * @param {string} status
 * @returns {AdminAction[]}
 */
export function allowedActions(status) {
  return ACTIONS_BY_STATUS[status] ?? [];
}

/**
 * @param {string} reason
 * @returns {string|null} error message, or null when the reason is long enough
 */
export function validateReason(reason) {
  return (reason ?? '').trim().length < REASON_MIN ? `Add a reason of at least ${REASON_MIN} characters` : null;
}

/**
 * Google Maps link for a pin; null without both coordinates.
 *
 * @param {number|null} lat
 * @param {number|null} lng
 * @returns {string|null}
 */
export function mapsLink(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/**
 * Instagram profile URL for a handle (a leading @ is ignored); null when there is no handle.
 *
 * @param {string|null} handle
 * @returns {string|null}
 */
export function instagramUrl(handle) {
  const clean = (handle ?? '').trim().replace(/^@/, '');
  return clean ? `https://instagram.com/${encodeURIComponent(clean)}` : null;
}

/**
 * User message for a failed decideApplication. Codes the global toast already covers (network,
 * forbidden, unknown) are handled there; this is for the ones the page shows itself.
 *
 * @param {unknown} error
 * @returns {string}
 */
export function decideErrorMessage(error) {
  const code = /** @type {{ code?: string, message?: string }} */ (error)?.code;
  if (code === 'conflict') return 'This application changed meanwhile — showing its current status';
  if (code === 'not_found') return "We couldn't find that application";
  if (code === 'validation') return /** @type {Error} */ (error).message || 'Add a reason';
  return userMessage(error);
}

/**
 * Absolute date for the audit trail, e.g. "12 Oct 2026".
 *
 * @param {string} iso
 * @returns {string}
 */
export function formatDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
