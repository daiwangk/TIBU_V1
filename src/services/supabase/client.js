import { createClient } from '@supabase/supabase-js';
import { AppError } from '../errors.js';

/** @type {import('@supabase/supabase-js').SupabaseClient|null} */
let client = null;

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

  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}
