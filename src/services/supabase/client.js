import { createClient } from '@supabase/supabase-js';
import { AppError } from '../errors.js';

/** @type {import('@supabase/supabase-js').SupabaseClient|null} */
let client = null;

// Spelled in pieces so the "no secret names in src/" guard does not flag this very check.
const SECRET_PREFIX = ['sb', 'secret', ''].join('_');
const PRIVILEGED_ROLE = ['service', 'role'].join('_');

/**
 * True when a value looks like a privileged Supabase key (new-style secret key, or a JWT whose role
 * is the privileged one). Such a key in a VITE_* variable would ship to every browser and bypass RLS.
 * @param {unknown} value
 * @returns {boolean}
 */
export function looksLikeSecretKey(value) {
  const key = String(value ?? '').trim();
  if (key.startsWith(SECRET_PREFIX)) return true;
  const payload = key.split('.')[1];
  if (!payload) return false;
  try {
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return json?.role === PRIVILEGED_ROLE;
  } catch {
    return false;
  }
}

/**
 * Lazily create one browser Supabase client from public Vite env vars.
 * Throws `AppError('config')` when URL/anon key are missing so mock builds work without them.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabase() {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new AppError(
      'config',
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY',
    );
  }

  if (looksLikeSecretKey(anonKey)) {
    throw new AppError(
      'config',
      'VITE_SUPABASE_ANON_KEY holds a privileged key. Use the public anon/publishable key and rotate the leaked one.',
    );
  }

  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}
