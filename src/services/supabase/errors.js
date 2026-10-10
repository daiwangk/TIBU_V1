import { AppError } from '../errors.js';

/**
 * Supabase Auth errors → contract codes (CONTRACT §11, A3.1 rows). Codes first, then the older message
 * text, so an auth-js upgrade that drops one of them doesn't turn a wrong password into "Something went wrong".
 *
 * @param {unknown} err
 * @param {string} message
 * @param {string} code
 * @returns {AppError|null}
 */
function mapAuthError(err, message, code) {
  const status = err && typeof err === 'object' && 'status' in err ? Number(err.status) : 0;

  if (code === 'invalid_credentials' || /invalid login credentials/i.test(message)) {
    return new AppError('validation', 'Email or password is incorrect', err);
  }
  if (code === 'email_not_confirmed' || /email not confirmed/i.test(message)) {
    return new AppError('validation', 'Please confirm your email first', err);
  }
  if (code === 'user_already_exists' || code === 'email_exists' || /user already registered/i.test(message)) {
    return new AppError('conflict', 'An account with this email already exists', err);
  }
  if (code === 'weak_password' || /password should be at least/i.test(message)) {
    return new AppError('validation', 'Choose a stronger password', err);
  }
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || status === 429) {
    return new AppError('rate_limited', 'Too many requests — try again in a bit', err);
  }
  return null;
}

/**
 * Map a Supabase / PostgREST / Postgres error to a contract `AppError` (CONTRACT §11).
 * Match the **message prefix** first (several share an errcode), then the code.
 *
 * @param {unknown} err
 * @returns {AppError}
 */
export function mapSupabaseError(err) {
  if (err instanceof AppError) return err;

  const message = String(
    (err && typeof err === 'object' && 'message' in err && err.message) || err || '',
  );
  const code = String(
    (err && typeof err === 'object' && 'code' in err && err.code) || '',
  );

  // Supabase Auth (GoTrue) errors carry a string `code` ("invalid_credentials") and an HTTP `status`.
  // Documented addition to CONTRACT §11 (A3.1). Matched first: their codes never collide with Postgres ones.
  const authError = mapAuthError(err, message, code);
  if (authError) return authError;

  // Message-prefix matches first (shared errcodes like P0002).
  // PGRST301 / PGRST303: expired or invalid JWT, treated like a missing login.
  if (message.startsWith('login_required') || code === '28000' || code === 'PGRST301' || code === 'PGRST303') {
    return new AppError('auth_required', message || 'Login required', err);
  }
  if (message.startsWith('business_not_available')) {
    return new AppError(
      'business_not_available',
      "This business isn't available right now",
      err,
    );
  }
  if (message.startsWith('rate_limited') || code === '53400') {
    return new AppError(
      'rate_limited',
      'Too many requests — try again in a bit',
      err,
    );
  }
  if (message.startsWith('cannot_enquire_own_business')) {
    return new AppError(
      'forbidden',
      "You can't send an enquiry to your own business",
      err,
    );
  }
  if (
    message.startsWith('forbidden')
    || message.startsWith('role_change_not_allowed')
    || message.includes('new row violates row-level security')
    || code === '42501'
  ) {
    return new AppError('forbidden', "You don't have access to that", err);
  }
  if (message.startsWith('incomplete_application:')) {
    const keys = message.slice('incomplete_application:'.length);
    const missing = keys.split(',').map((k) => k.trim()).filter(Boolean);
    if (err && typeof err === 'object') err.missing = missing;
    return new AppError('validation', 'Complete your application first', err);
  }
  if (message.startsWith('reason_required')) {
    return new AppError('validation', 'Add a reason', err);
  }
  if (
    message.startsWith('invalid_status:')
    || message.startsWith('invalid_transition:')
  ) {
    return new AppError(
      'conflict',
      "That action isn't possible in the current status",
      err,
    );
  }
  if (
    message.startsWith('not_found')
    || message.startsWith('no_business')
    || code === 'PGRST116'
  ) {
    return new AppError('not_found', "We couldn't find that", err);
  }
  // Never surface Postgres text (constraint and column names) — the original stays on `cause`.
  if (code === '23505') {
    return new AppError('conflict', 'That already exists', err);
  }
  if (code === '23514' || code === '22P02') {
    return new AppError('validation', "That value isn't valid", err);
  }
  if (
    code === 'P0002'
    && !message.startsWith('business_not_available')
    && !message.startsWith('not_found')
  ) {
    // Shared Postgres "no_data_found"-style code without a known prefix.
    return new AppError('not_found', "We couldn't find that", err);
  }

  // A TypeError is only "offline" when the browser says the request failed; other TypeErrors are bugs.
  const looksNetwork = /failed to fetch|networkerror|load failed|network request failed/i.test(message);
  if (looksNetwork) {
    return new AppError(
      'network',
      "You're offline — check your connection",
      err,
    );
  }

  return new AppError('unknown', 'Something went wrong', err);
}
