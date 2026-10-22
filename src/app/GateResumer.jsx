/**
 * GateResumer — src/app/GateResumer.jsx
 *
 * Null-rendering component mounted inside BrowserRouter.
 * When auth status transitions to 'authenticated' and there is a non-expired
 * pending action in localStorage:
 *   1. Navigate to returnTo if location.pathname differs.
 *   2. Call resumePending() to clear the entry and run the registered handler.
 *
 * Importing src/queries/contact.js here (constraint b) guarantees the
 * 'whatsapp' and 'call' gate handlers are registered before resumePending
 * fires, regardless of which page is currently loaded.
 */

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getWithExpiry } from '../lib/storage.js';
import { resumePending } from '../stores/loginGate.js';
import { useAuthStore } from '../stores/auth.js';

// Side-effect imports — register gate handlers for 'whatsapp', 'call', 'save', and 'enquiry' at boot
import '../queries/contact.js';
import '../queries/saved.js';
import '../queries/activity.js';
import '../queries/enquiries.js';
import { flushLocalRecent } from '../queries/activity.js';

const STORAGE_KEY = 'tibu.pendingAction';

/**
 * Watches auth status and replays the pending action after login.
 * Returns null — no UI rendered.
 */
export function GateResumer() {
  const authStatus = useAuthStore((s) => s.status);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  // Guard against running resume multiple times in the same authenticated session
  const hasResumed = useRef(false);

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
    // Reset guard whenever user logs out or leaves authenticated state
    if (authStatus !== 'authenticated') {
      hasResumed.current = false;
      return;
    }

    if (hasResumed.current) return;

    // Peek at the pending action without consuming it (resumePending will consume)
    const pending = getWithExpiry(STORAGE_KEY);
    if (!pending) return;

    hasResumed.current = true;

    const doResume = async () => {
      const currentPath = location.pathname + location.search;
      if (pending.returnTo && currentPath !== pending.returnTo) {
        navigate(pending.returnTo, { replace: true });
        // yield one tick so the route update settles before resuming
        await new Promise((r) => setTimeout(r, 0));
      }
      resumePending(queryClient);
    };

    doResume();
  }, [authStatus, location.pathname, location.search, navigate, queryClient]);

  return null;
}
