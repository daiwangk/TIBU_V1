import { create } from 'zustand';

/**
 * Who is signed in. Not persisted: supabase-js keeps the session itself and AuthBootstrap restores it.
 * `loading` until the first answer arrives, so guards never flash the login redirect for a signed-in user.
 *
 * `sessionVersion` stays stable during initial session restoration. After that it
 * advances on user ID changes, including sign-out, but not on same-user events.
 * AppShell uses it as a remount key. Mutation callbacks use it to discard results
 * from an earlier session, even if the same account has since signed back in.
 */
export const useAuthStore = create((set, get) => ({
  status: 'loading',
  session: null,
  sessionVersion: 0,

  /** @param {import('../services/contract.js').Session|null} session */
  setSession: (session) => {
    const { session: current, status, sessionVersion } = get();
    // Token refreshes re-send the same user; keep the object so subscribers don't re-render.
    if (session && current && current.userId === session.userId && current.email === session.email) {
      if (status !== 'authenticated') set({ status: 'authenticated' });
      return;
    }
    const identityChanged = (current?.userId ?? null) !== (session?.userId ?? null);
    set({
      session: session ?? null,
      status: session ? 'authenticated' : 'guest',
      sessionVersion: status !== 'loading' && identityChanged ? sessionVersion + 1 : sessionVersion,
    });
  },
}));
