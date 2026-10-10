import { qk } from '../queries/keys.js';

/**
 * Keeps the auth store in step with the auth service. No React in here, so it can be tested directly.
 *
 * - not the supabase data source (mock): status 'guest', Supabase is never touched
 * - otherwise: subscribe first, then ask for the current session (an event that arrives meanwhile wins)
 * - SIGNED_OUT clears every cached query, so the next person on a shared phone sees none of the last one's data
 * - SIGNED_IN / USER_UPDATED refetch the profile
 *
 * @param {{
 *   dataSource: string,
 *   getSession: () => Promise<import('../services/contract.js').Session|null>,
 *   onAuthChange: (cb: (session: import('../services/contract.js').Session|null, event: string) => void) => () => void,
 *   queryClient: { clear: () => void, invalidateQueries: (filters: object) => unknown },
 *   setSession: (session: import('../services/contract.js').Session|null) => void,
 * }} deps
 * @returns {() => void} stop
 */
export function startAuthSync({ dataSource, getSession, onAuthChange, queryClient, setSession }) {
  if (dataSource !== 'supabase') {
    setSession(null);
    return () => {};
  }

  let stopped = false;
  let eventSeen = false;

  let unsubscribe = () => {};
  try {
    unsubscribe = onAuthChange((session, event) => {
      if (stopped) return;
      eventSeen = true;
      setSession(session);
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        queryClient.invalidateQueries({ queryKey: qk.me });
      }
    });
  } catch {
    // Missing Supabase config: browse as a guest rather than crash the app.
    setSession(null);
    return () => {};
  }

  getSession()
    .then((session) => {
      if (!stopped && !eventSeen) setSession(session);
    })
    .catch(() => {
      if (!stopped && !eventSeen) setSession(null);
    });

  return () => {
    stopped = true;
    unsubscribe();
  };
}
