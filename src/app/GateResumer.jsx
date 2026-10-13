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
import { getWithExpiry } from '../lib/storage.js';
import { resumePending } from '../stores/loginGate.js';
import { useAuthStore } from '../stores/auth.js';

// Named import to pull in src/queries/contact.js — this registers the
// 'whatsapp' and 'call' gate handlers as a module-level side effect (constraint b).
import { performContactAction as _registerContactHandlers } from '../queries/contact.js';

const STORAGE_KEY = 'tibu.pendingAction';

/**
 * Watches auth status and replays the pending action after login.
 * Returns null — no UI rendered.
 */
export function GateResumer() {
  const authStatus = useAuthStore((s) => s.status);
  const navigate = useNavigate();
  const location = useLocation();

  // Track the previous status so we react only on the 'loading'/'guest' → 'authenticated' transition
  const prevStatus = useRef(authStatus);

  useEffect(() => {
    const wasAuthenticated = prevStatus.current === 'authenticated';
    prevStatus.current = authStatus;

    // Only run when we just became authenticated (not on every render while authenticated)
    if (authStatus !== 'authenticated' || wasAuthenticated) return;

    // Peek at the pending action without consuming it (resumePending will consume)
    const pending = getWithExpiry(STORAGE_KEY);
    if (!pending) return;

    const doResume = async () => {
      if (pending.returnTo && location.pathname !== pending.returnTo) {
        navigate(pending.returnTo, { replace: true });
        // yield one tick so the route update settles before resuming
        await new Promise((r) => setTimeout(r, 0));
      }
      resumePending();
    };

    doResume();
  }, [authStatus, location.pathname, navigate]);

  return null;
}
