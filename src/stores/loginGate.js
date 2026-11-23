/**
 * Login gate store — src/stores/loginGate.js
 *
 * Manages the "log in to contact" flow (DECISIONS D10, D11).
 *
 * State
 *   open    – whether the login sheet should be visible
 *   pending – the action that triggered the gate (null when none)
 *
 * Pending shape:
 *   { type: 'whatsapp'|'call'|'save'|'enquiry'|'review',
 *     payload: any,
 *     returnTo: string,
 *     createdAt: number }
 *
 * Gate-handler registry (module-level, survives store resets):
 *   registerGateHandler(type, fn) – register a handler for a pending type
 *   resumePending()               – execute the pending action and clear it on success
 */

import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { toast } from 'sonner';
import { userMessage } from '../lib/errors.js';
import { setWithExpiry } from '../lib/storage.js';
import { isAppError } from '../services/errors.js';

const STORAGE_KEY = 'tibu.pendingAction';
const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
const RETRYABLE_CODES = new Set(['network', 'rate_limited', 'unknown']);

/** @type {Map<string, (action: PendingAction, context?: unknown) => unknown>} */
const handlers = new Map();
let replaying = false;

/**
 * Register a handler function for a pending action type.
 * Safe to call multiple times — last registration wins.
 *
 * @param {string} type
 * @param {(action: PendingAction, context?: unknown) => unknown} fn
 */
export function registerGateHandler(type, fn) {
  handlers.set(type, fn);
}

function readPending() {
  const { pending, memoryOnly } = useLoginGateStore.getState();
  if (!memoryOnly) {
    let raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage is unavailable. A readable but empty slot is authoritative.
    }
    if (raw === null) return null;
    if (raw !== undefined) {
      try {
        const entry = JSON.parse(raw);
        if (entry?.value && typeof entry.expiresAt === 'number' && entry.expiresAt > Date.now()) {
          return { action: entry.value, raw };
        }
      } catch {
        // Treat an invalid stored entry like an expired one.
      }
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* Storage may be read-only. */ }
      return null;
    }
  }
  return pending && pending.createdAt + EXPIRY_MS > Date.now()
    ? { action: pending, raw: null }
    : null;
}

function matchesEntry(a, b) {
  if (!a || !b) return false;
  return a.raw === null ? a.action === b.action : a.raw === b.raw;
}

/**
 * The non-expired pending action, without consuming it (null when none). Auth screens use it to leave
 * the post-login navigation to GateResumer when an action is waiting.
 *
 * @returns {PendingAction|null}
 */
export function peekPending() {
  return readPending()?.action ?? null;
}

/**
 * Run the pending action once. Handlers may show a terminal message themselves.
 * A rejection gets the standard toast here and keeps the action only if retryable.
 *
 * If no handler is registered for the type (e.g. 'save', 'enquiry',
 * 'review' which don't exist yet) the entry is cleared silently — no
 * throw, no stale entry left behind (constraint c).
 */
export async function resumePending(context, expectedAction) {
  if (replaying) return;
  const entry = readPending();
  if (!entry || (expectedAction && JSON.stringify(expectedAction) !== JSON.stringify(entry.action))) return;

  async function run() {
    if (!matchesEntry(entry, readPending())) return;
    const initialMemory = useLoginGateStore.getState().pending;
    useLoginGateStore.getState().close();
    try {
      await handlers.get(entry.action.type)?.(entry.action, context);
    } catch (error) {
      toast.error(userMessage(error));
      const code = isAppError(error) ? error.code : 'unknown';
      if (RETRYABLE_CODES.has(code)) return;
    }
    if (entry.raw !== null && matchesEntry(entry, readPending())) {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* Storage may be read-only. */ }
    }
    if (useLoginGateStore.getState().pending === initialMemory) {
      useLoginGateStore.setState({ open: false, pending: null });
    }
  }

  replaying = true;
  try {
    const locks = typeof navigator === 'undefined' ? undefined : navigator.locks;
    if (entry.raw !== null && locks) {
      await locks.request(STORAGE_KEY, { ifAvailable: true }, (lock) => lock ? run() : undefined);
    } else {
      await run();
    }
  } catch (error) {
    toast.error(userMessage(error));
  } finally {
    replaying = false;
  }
}

/**
 * @typedef {Object} PendingAction
 * @property {'whatsapp'|'call'|'save'|'enquiry'|'review'} type
 * @property {object} payload
 * @property {string} returnTo  – pathname to navigate back to after login
 * @property {number} createdAt – ms timestamp
 */

/**
 * @typedef {Object} LoginGateState
 * @property {boolean} open
 * @property {PendingAction|null} pending
 * @property {boolean} memoryOnly
 * @property {(action: PendingAction) => void} request
 * @property {() => void} cancel
 * @property {() => void} close
 */

export const useLoginGateStore = create((set) => ({
  open: false,
  pending: null,
  memoryOnly: false,

  /**
   * Open the login gate and persist the pending action so it survives
   * a full page reload / redirect to the login page.
   *
   * @param {{ type: string, payload: object, returnTo: string }} action
   */
  request(action) {
    const pending = {
      type: action.type,
      payload: action.payload,
      returnTo: action.returnTo,
      createdAt: Date.now(),
    };
    const persisted = setWithExpiry(STORAGE_KEY, pending, EXPIRY_MS);
    set({ open: true, pending, memoryOnly: !persisted });
  },

  /**
   * User dismissed the sheet without logging in.
   * Removes the persisted action AND closes the sheet (constraint d).
   */
  cancel() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable — nothing to do
    }
    set({ open: false, pending: null, memoryOnly: false });
  },

  /**
   * Close the sheet without clearing the pending entry.
   * (Used internally after resumePending completes.)
   */
  close() {
    set({ open: false });
  },
}));

/**
 * `storage` event handler: another tab consumed or cancelled the pending action, so this tab's open
 * sheet would be asking about an action that no longer exists. Close it. Only reacts when the persisted
 * action is really gone, so a tab where localStorage is blocked (in-memory pending) is left alone — and
 * `storage` events never fire in the tab that made the change.
 *
 * @param {{ key: string|null }} event
 */
export function handlePendingStorageEvent(event) {
  if (event.key !== null && event.key !== STORAGE_KEY) return; // null = storage.clear()
  if (peekPending()) return;
  if (useLoginGateStore.getState().open || useLoginGateStore.getState().pending) {
    useLoginGateStore.setState({ open: false, pending: null, memoryOnly: false });
  }
}

/**
 * Subscribe to changes of the pending action: this tab's gate store, and `storage` events, which is how
 * another tab consuming or clearing the action reaches this one.
 *
 * @param {() => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribePending(callback) {
  window.addEventListener('storage', callback);
  const unsubscribe = useLoginGateStore.subscribe(callback);
  return () => {
    window.removeEventListener('storage', callback);
    unsubscribe();
  };
}

/**
 * Live "is a gated action waiting?" for screens that must react when it is taken (here or in another
 * tab). Reading `peekPending()` once at render time goes stale.
 *
 * @returns {boolean}
 */
export function useHasPendingAction() {
  return useSyncExternalStore(subscribePending, () => !!peekPending(), () => false);
}
