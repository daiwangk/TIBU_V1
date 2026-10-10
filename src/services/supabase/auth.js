import { AppError } from '../errors.js';
import { getSupabase } from './client.js';
import { mapSupabaseError } from './errors.js';

/**
 * Public site origin for auth e-mail links. `VITE_SITE_URL`, else the page's own origin (local dev).
 * @returns {string}
 */
export function siteUrl() {
  const configured = String(import.meta.env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, '');
  if (configured) return configured;
  return typeof window === 'undefined' ? '' : window.location.origin;
}

/**
 * supabase-js session → contract `Session`.
 * @param {{ user?: { id: string, email?: string|null } }|null|undefined} session
 * @returns {import('../contract.js').Session}
 */
export function toSession(session) {
  const user = session?.user;
  if (!user?.id) return null;
  return { userId: user.id, email: user.email ?? '' };
}

/** @returns {Promise<import('../contract.js').Session>} */
export async function getSession() {
  const { data, error } = await getSupabase().auth.getSession();
  if (error) throw mapSupabaseError(error);
  return toSession(data?.session);
}

/**
 * Subscribe to sign-in / sign-out / token refresh. The callback gets `(session, event)`; the event name
 * (e.g. 'SIGNED_OUT') is what lets the app clear cached data. Keep the callback synchronous: supabase-js
 * can deadlock if it awaits another auth call from inside this listener.
 *
 * @param {(session: import('../contract.js').Session, event: string) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onAuthChange(callback) {
  const { data } = getSupabase().auth.onAuthStateChange((event, session) => {
    callback(toSession(session), event);
  });
  return () => data.subscription.unsubscribe();
}

/**
 * Create an account. `signup_as` decides the profile role in the `handle_new_user` trigger
 * (migration 0002): only the exact value 'seller' makes a seller, anything else is a customer.
 *
 * @param {{ email: string, password: string, fullName: string, signupAs?: 'customer'|'seller' }} input
 * @returns {Promise<{ needsEmailConfirmation: boolean }>}
 */
export async function signUp({ email, password, fullName, signupAs = 'customer' }) {
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, signup_as: signupAs === 'seller' ? 'seller' : 'customer' },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });
  if (error) throw mapSupabaseError(error);
  // With e-mail confirmation on, an existing address returns a user with no identities instead of an error.
  if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new AppError('conflict', 'An account with this email already exists');
  }
  return { needsEmailConfirmation: !data?.session };
}

/**
 * @param {{ email: string, password: string }} input
 * @returns {Promise<import('../contract.js').Session>}
 */
export async function signIn({ email, password }) {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw mapSupabaseError(error);
  return toSession(data?.session);
}

/** @returns {Promise<void>} */
export async function signOut() {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw mapSupabaseError(error);
}

/**
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function sendPasswordReset(email) {
  const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/reset-password`,
  });
  if (error) throw mapSupabaseError(error);
}

/**
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
export async function updatePassword(newPassword) {
  const { error } = await getSupabase().auth.updateUser({ password: newPassword });
  if (error) throw mapSupabaseError(error);
}
