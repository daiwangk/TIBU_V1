import { isAppError } from '../services/errors.js';

const FALLBACK = 'Something went wrong';

/** Fixed user-facing text per `AppError.code` (CONTRACT §11). */
const MESSAGES = {
  network: "You're offline — check your connection",
  rate_limited: 'Too many requests — try again in a bit',
  forbidden: "You don't have access to that",
  business_not_available: "This business isn't available right now",
  not_found: "We couldn't find that",
  auth_required: 'Please log in to continue',
};

/** Codes that get a global toast. Everything else is handled where it happens (forms, login gate, ErrorState). */
const TOAST_CODES = new Set(['network', 'rate_limited', 'forbidden', 'business_not_available', 'unknown']);

/**
 * Message safe to show a user for any thrown value.
 * `validation` / `conflict` messages are already user-safe (CONTRACT §1.3), so they pass through.
 * Anything unrecognised — including `config`, `unavailable_in_mock` and non-AppErrors — is generic.
 *
 * @param {unknown} error
 * @returns {string}
 */
export function userMessage(error) {
  if (!isAppError(error)) return FALLBACK;
  if (MESSAGES[error.code]) return MESSAGES[error.code];
  if ((error.code === 'validation' || error.code === 'conflict') && error.message) return error.message;
  return FALLBACK;
}

/**
 * Whether a failed query/mutation should raise a global toast.
 * `auth_required` never toasts (the login gate handles it); non-AppErrors count as `unknown`.
 * Queries that render their own ErrorState set `meta: { silent: true }`.
 *
 * @param {unknown} error
 * @param {{ silent?: boolean }} [meta]
 * @returns {boolean}
 */
export function shouldToast(error, meta) {
  if (meta?.silent) return false;
  if (!isAppError(error)) return true;
  return TOAST_CODES.has(error.code);
}
