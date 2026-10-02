import { AppError } from '../errors.js';

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

  // Message-prefix matches first (shared errcodes like P0002).
  if (message.startsWith('login_required') || code === '28000') {
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
    return new AppError('validation', message, err);
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
    return new AppError('not_found', message || 'Not found', err);
  }
  if (code === '23505') {
    return new AppError('conflict', message || 'Already exists', err);
  }
  if (code === '23514' || code === '22P02') {
    return new AppError('validation', message || 'Invalid input', err);
  }
  if (
    code === 'P0002'
    && !message.startsWith('business_not_available')
    && !message.startsWith('not_found')
  ) {
    // Shared Postgres "no_data_found"-style code without a known prefix.
    return new AppError('not_found', message || 'Not found', err);
  }

  const looksNetwork =
    (err && typeof err === 'object' && 'name' in err && err.name === 'TypeError')
    || /failed to fetch|networkerror|load failed|network request failed/i.test(message);
  if (looksNetwork) {
    return new AppError(
      'network',
      "You're offline — check your connection",
      err,
    );
  }

  return new AppError('unknown', 'Something went wrong', err);
}
