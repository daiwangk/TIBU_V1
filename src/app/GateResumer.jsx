/**
 * GateResumer — src/app/GateResumer.jsx
 *
 * Null-rendering component mounted inside BrowserRouter.
 * When auth status transitions to 'authenticated' and there is a non-expired
 * pending action:
 *   1. Navigate to returnTo if location.pathname differs.
 *   2. Call resumePending() once and let it clear the entry on success.
 *
 * Importing src/queries/contact.js here (constraint b) guarantees the
 * 'whatsapp' and 'call' gate handlers are registered before resumePending
 * fires, regardless of which page is currently loaded.
 */

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { peekPending, resumePending } from '../stores/loginGate.js';
import { useAuthStore } from '../stores/auth.js';

// Side-effect imports — register gate handlers for 'whatsapp', 'call', 'save', 'enquiry', and 'review' at boot
import '../queries/contact.js';
import '../queries/saved.js';
import '../queries/activity.js';
import '../queries/enquiries.js';
import '../queries/reviews.js';
import { flushLocalRecent } from '../queries/activity.js';

/**
 * Watches auth status and replays the pending action after login.
 * Returns null — no UI rendered.
 */
export function GateResumer() {
  const authStatus = useAuthStore((s) => s.status);
  const sessionVersion = useAuthStore((s) => s.sessionVersion);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  // Guard against running resume multiple times in the same authenticated session
  const attemptedVersion = useRef(null);

  // Separate guard for the local-history flush (runs once per authenticated session)
  const hasFlushed = useRef(false);

  // Flush guest recent views to the server on first login
  useEffect(() => {
    if (authStatus !== 'authenticated') {
      hasFlushed.current = false;
      return;
    }
    if (hasFlushed.current) return;
    hasFlushed.current = true;
    flushLocalRecent();
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== 'authenticated' || attemptedVersion.current === sessionVersion) return;

    // Peek at the pending action without consuming it (resumePending will consume)
    const pending = peekPending();
    if (!pending) return;

    attemptedVersion.current = sessionVersion;

    const doResume = async () => {
      const currentPath = location.pathname + location.search;
      if (pending.returnTo && currentPath !== pending.returnTo) {
        navigate(pending.returnTo, { replace: true });
        // yield one tick so the route update settles before resuming
        await new Promise((r) => setTimeout(r, 0));
      }
      const auth = useAuthStore.getState();
      if (auth.status === 'authenticated' && auth.sessionVersion === sessionVersion) {
        await resumePending(queryClient, pending);
      }
    };

    doResume();
  }, [authStatus, sessionVersion, location.pathname, location.search, navigate, queryClient]);

  return null;
}
