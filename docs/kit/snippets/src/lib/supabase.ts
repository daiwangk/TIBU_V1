// src/lib/supabase.ts — single shared client
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database'; // generated: npm run gen:types

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');

export const supabase = createClient<Database>(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

/** Map Postgres error messages raised in our RPCs to UI-friendly codes. */
export function rpcErrorCode(err: { message?: string } | null): string | null {
  if (!err?.message) return null;
  const known = ['login_required', 'rate_limited', 'business_not_available', 'forbidden',
    'incomplete_application', 'invalid_transition', 'reason_required', 'cannot_enquire_own_business'];
  return known.find((k) => err.message!.startsWith(k)) ?? 'unknown';
}
