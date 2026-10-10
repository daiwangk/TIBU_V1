import { create } from 'zustand';

/**
 * Who is signed in. Not persisted: supabase-js keeps the session itself and AuthBootstrap restores it.
 * `loading` until the first answer arrives, so guards never flash the login redirect for a signed-in user.
 *
 * State: `{ status: 'loading' | 'guest' | 'authenticated', session: Session | null, setSession(session) }`.
 */
export const useAuthStore = create((set, get) => ({
  status: 'loading',
  session: null,

  /** @param {import('../services/contract.js').Session|null} session */
  setSession: (session) => {
    const current = get().session;
    // Token refreshes re-send the same user; keep the object so subscribers don't re-render.
    if (session && current && current.userId === session.userId && current.email === session.email) {
      if (get().status !== 'authenticated') set({ status: 'authenticated' });
      return;
    }
    set({ session: session ?? null, status: session ? 'authenticated' : 'guest' });
  },
}));
