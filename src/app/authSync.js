import { qk } from '../queries/keys.js';
import { useLocationStore } from '../stores/location.js';

/**
 * Keeps the auth store in step with the auth service. No React in here, so it can be tested directly.
 *
 * - not the supabase data source (mock): status 'guest', Supabase is never touched
 * - otherwise: subscribe first, then ask for the current session (an event that arrives meanwhile wins)
 * - an identity change cancels queries and clears the cache before the next session is published
 * - same-account SIGNED_IN / USER_UPDATED refetch the profile
 *
 * @param {{
 *   dataSource: string,
 *   getSession: () => Promise<import('../services/contract.js').Session|null>,
 *   onAuthChange: (cb: (session: import('../services/contract.js').Session|null, event: string) => void) => () => void,
 *   queryClient: import('@tanstack/react-query').QueryClient,
 *   setSession: (session: import('../services/contract.js').Session|null) => void,
 *   initialUserId?: string|null,
 * }} deps
 * @returns {() => void} stop
 */
export function startAuthSync({ dataSource, getSession, onAuthChange, queryClient, setSession, initialUserId = null }) {
  let currentUserId = initialUserId;
  let identityResolved = false;

  function syncSession(session) {
    const userId = session?.userId ?? null;
    const changed = userId !== currentUserId;
    if (changed) {
      void queryClient.cancelQueries();
      // Clears query and mutation records. Mutation callbacks must still guard late results.
      queryClient.clear();
      currentUserId = userId;
    }
    if (!identityResolved || changed) {
      useLocationStore.getState().reconcileProfileOwner(userId);
      identityResolved = true;
    }
    setSession(session);
    return changed;
  }

  if (dataSource !== 'supabase') {
    syncSession(null);
    return () => {};
  }

  let stopped = false;
  let eventSeen = false;

  let unsubscribe = () => {};
  try {
    unsubscribe = onAuthChange((session, event) => {
      if (stopped) return;
      eventSeen = true;
      const changed = syncSession(session);
      if (!changed && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        queryClient.invalidateQueries({ queryKey: qk.me });
      }
    });
  } catch {
    // Missing Supabase config: browse as a guest rather than crash the app.
    syncSession(null);
    return () => {};
  }

  getSession()
    .then((session) => {
      if (!stopped && !eventSeen) syncSession(session);
    })
    .catch(() => {
      if (!stopped && !eventSeen) syncSession(null);
    });

  return () => {
    stopped = true;
    unsubscribe();
  };
}
