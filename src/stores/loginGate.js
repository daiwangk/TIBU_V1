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
 *   resumePending()               – read, clear, and execute the pending action
 */

import { create } from 'zustand';
import { getWithExpiry, setWithExpiry } from '../lib/storage.js';

const STORAGE_KEY = 'tibu.pendingAction';
const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

/** @type {Map<string, (action: object) => void>} */
const handlers = new Map();

/**
 * Register a handler function for a pending action type.
 * Safe to call multiple times — last registration wins.
 *
 * @param {string} type
 * @param {(action: object) => void} fn
 */
export function registerGateHandler(type, fn) {
  handlers.set(type, fn);
}

/**
 * The non-expired pending action, without consuming it (null when none). Auth screens use it to leave
 * the post-login navigation to GateResumer when an action is waiting.
 *
 * @returns {PendingAction|null}
 */
export function peekPending() {
  return getWithExpiry(STORAGE_KEY);
}

/**
 * Read the non-expired pending action from localStorage, clear it,
 * and execute its registered handler (if any).
 *
 * If no handler is registered for the type (e.g. 'save', 'enquiry',
 * 'review' which don't exist yet) the entry is cleared silently — no
 * throw, no stale entry left behind (constraint c).
 */
export function resumePending(context) {
  const action = getWithExpiry(STORAGE_KEY); // also removes if expired
  if (!action) {
    useLoginGateStore.setState({ open: false, pending: null });
    return;
  }

  // Always clear storage before running — prevents double-execution on errors
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage may be unavailable; getWithExpiry already removed it
  }

  const handler = handlers.get(action.type);
  if (!handler) {
    useLoginGateStore.setState({ open: false, pending: null });
    return; // unknown type — clear and do nothing
  }

  try {
    handler(action, context);
  } finally {
    useLoginGateStore.setState({ open: false, pending: null });
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
 * @property {(action: PendingAction) => void} request
 * @property {() => void} cancel
 * @property {() => void} close
 */

export const useLoginGateStore = create((set) => ({
  open: false,
  pending: null,

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
    setWithExpiry(STORAGE_KEY, pending, EXPIRY_MS);
    set({ open: true, pending });
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
    set({ open: false, pending: null });
  },

  /**
   * Close the sheet without clearing the pending entry.
   * (Used internally after resumePending completes.)
   */
  close() {
    set({ open: false });
  },
}));
