import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** How long a page waits for GateResumer before taking over the post-login navigation. */
export const DEFER_MS = 1500;

/**
 * Post-login navigation for the auth pages. Returns `onSuccess({ hadPending })` for the forms.
 *
 * - No gated action was waiting: go to `next` (or Home) at once.
 * - One was: GateResumer navigates to where it started and replays it, so the page stays put. But the
 *   action can vanish without GateResumer acting (it expired during the request, or another tab took
 *   it), so a fallback timer sends the user on if this page is still mounted. When GateResumer does
 *   navigate away the page unmounts and the timer is cancelled, so there is no double navigation.
 *
 * @param {string|null} next safe `?next=` path
 * @returns {(info: { hadPending: boolean }) => void}
 */
export function useAfterAuth(next) {
  const navigate = useNavigate();
  const [deferred, setDeferred] = useState(false);

  useEffect(() => {
    if (!deferred) return undefined;
    const timer = setTimeout(() => navigate(next ?? '/', { replace: true }), DEFER_MS);
    return () => clearTimeout(timer);
  }, [deferred, next, navigate]);

  return useCallback(
    ({ hadPending }) => {
      if (hadPending) setDeferred(true);
      else navigate(next ?? '/', { replace: true });
    },
    [navigate, next],
  );
}
