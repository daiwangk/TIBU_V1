import { userMessage } from '../../lib/errors';

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/auth'];

/**
 * The `?next=` value if it is a same-site path, else null. Blocks `//evil.com`, `/\evil.com`, absolute
 * URLs and auth screens (which would loop back here).
 *
 * @param {string|null|undefined} raw already decoded (URLSearchParams.get)
 * @returns {string|null}
 */
export function safeNextPath(raw) {
  if (typeof raw !== 'string' || !raw.startsWith('/')) return null;
  if (raw.startsWith('//') || raw.startsWith('/\\')) return null;
  const pathname = raw.split(/[?#]/)[0];
  if (AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return raw;
}

/**
 * `path` with `?next=` (and any extra params) kept, e.g. withNext('/signup', '/saved', { as: 'seller' }).
 *
 * @param {string} path
 * @param {string|null} next
 * @param {Record<string, string|null|undefined>} [extra]
 * @returns {string}
 */
export function withNext(path, next, extra = {}) {
  const params = new URLSearchParams();
  if (next) params.set('next', next);
  for (const [key, value] of Object.entries(extra)) if (value) params.set(key, value);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

/**
 * Text for a failed auth call. Mock builds have no accounts, so they get a friendly line instead of
 * "Something went wrong".
 *
 * @param {unknown} error
 * @returns {string}
 */
export function authErrorMessage(error) {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'unavailable_in_mock') {
    return "Accounts aren't available in this demo build.";
  }
  return userMessage(error);
}

/**
 * Sign-in refused because the e-mail address hasn't been confirmed yet (CONTRACT §11).
 * @param {unknown} error
 * @returns {boolean}
 */
export function isEmailNotConfirmed(error) {
  if (!error || typeof error !== 'object' || error.code !== 'validation') return false;
  const cause = /** @type {{ code?: string, message?: string }|undefined} */ (error.cause);
  return cause?.code === 'email_not_confirmed'
    || /email not confirmed/i.test(cause?.message ?? '')
    || /confirm your email/i.test(error.message ?? '');
}

/**
 * Error carried back on an auth e-mail link (`#error=…&error_code=otp_expired&error_description=…`).
 *
 * @param {string} hash  location.hash
 * @param {string} search  location.search
 * @returns {string|null} a user-facing sentence, or null when the link carries no error
 */
export function linkErrorMessage(hash, search) {
  const params = new URLSearchParams(String(hash ?? '').replace(/^#/, ''));
  const query = new URLSearchParams(search ?? '');
  const code = params.get('error_code') ?? query.get('error_code');
  const error = params.get('error') ?? query.get('error');
  if (!code && !error) return null;
  if (code === 'otp_expired') return 'This link has expired or was already used.';
  return 'This link is invalid or has expired.';
}
