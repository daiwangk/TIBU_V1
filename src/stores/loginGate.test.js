/**
 * Unit tests for src/stores/loginGate.js
 *
 * Covers (per task constraint g):
 *   1. request() persists the action to localStorage with expiry
 *   2. cancel() removes localStorage entry and closes the sheet
 *   3. Expired pending action is ignored by resumePending
 *   4. resumePending with an unknown type clears the entry and does nothing
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { handlePendingStorageEvent, peekPending, registerGateHandler, resumePending, subscribePending, useLoginGateStore } from './loginGate.js';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, String(value));
    },
    removeItem: (key) => {
      map.delete(key);
    },
    clear: () => {
      map.clear();
    },
  };
}

/** Read and JSON-parse the raw localStorage entry for 'tibu.pendingAction'. */
function readRaw() {
  const raw = localStorage.getItem('tibu.pendingAction');
  return raw ? JSON.parse(raw) : null;
}

function resetStore() {
  useLoginGateStore.setState({ open: false, pending: null, memoryOnly: false });
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubGlobal('localStorage', createMemoryStorage());
  vi.stubGlobal('navigator', {});
  resetStore();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('request()', () => {
  it('opens the sheet and sets pending in store', () => {
    useLoginGateStore.getState().request({
      type: 'whatsapp',
      payload: { businessId: 'biz-1' },
      returnTo: '/b/ammas-kitchen',
    });

    const state = useLoginGateStore.getState();
    expect(state.open).toBe(true);
    expect(state.pending).toMatchObject({
      type: 'whatsapp',
      payload: { businessId: 'biz-1' },
      returnTo: '/b/ammas-kitchen',
    });
    expect(typeof state.pending.createdAt).toBe('number');
  });

  it('persists the action to localStorage with a future expiresAt', () => {
    const before = Date.now();
    useLoginGateStore.getState().request({
      type: 'call',
      payload: { businessId: 'biz-2' },
      returnTo: '/b/sweet-crumbs',
    });
    const after = Date.now();

    const raw = readRaw();
    expect(raw).not.toBeNull();
    expect(raw.value.type).toBe('call');
    expect(raw.value.returnTo).toBe('/b/sweet-crumbs');
    // expiresAt should be ~30 min in the future
    expect(raw.expiresAt).toBeGreaterThan(before + 29 * 60 * 1000);
    expect(raw.expiresAt).toBeLessThanOrEqual(after + 30 * 60 * 1000);
  });
});

describe('cancel()', () => {
  it('closes the sheet, clears pending in store, and removes localStorage entry', () => {
    useLoginGateStore.getState().request({
      type: 'whatsapp',
      payload: {},
      returnTo: '/b/ammas-kitchen',
    });
    expect(localStorage.getItem('tibu.pendingAction')).not.toBeNull();

    useLoginGateStore.getState().cancel();

    const state = useLoginGateStore.getState();
    expect(state.open).toBe(false);
    expect(state.pending).toBeNull();
    expect(localStorage.getItem('tibu.pendingAction')).toBeNull();
  });
});

describe('close()', () => {
  it('sets open to false but keeps pending in the store', () => {
    useLoginGateStore.getState().request({
      type: 'whatsapp',
      payload: { businessId: 'biz-3' },
      returnTo: '/b/ammas-kitchen',
    });
    useLoginGateStore.getState().close();

    const state = useLoginGateStore.getState();
    expect(state.open).toBe(false);
    // pending is NOT cleared by close()
    expect(state.pending).not.toBeNull();
  });
});

describe('peekPending()', () => {
  it('returns the pending action without consuming it', () => {
    expect(peekPending()).toBeNull();
    useLoginGateStore.getState().request({ type: 'save', payload: { kind: 'product', id: 'p1', saved: true }, returnTo: '/p/p1' });
    expect(peekPending()).toMatchObject({ type: 'save', returnTo: '/p/p1' });
    expect(peekPending()).not.toBeNull();
  });
});

describe('subscribePending()', () => {
  function fakeWindow() {
    const listeners = new Map();
    return {
      listeners,
      addEventListener: (type, fn) => listeners.set(type, fn),
      removeEventListener: (type, fn) => { if (listeners.get(type) === fn) listeners.delete(type); },
    };
  }

  it('notifies on storage events (another tab) and on this tab’s gate store changes', () => {
    const win = fakeWindow();
    vi.stubGlobal('window', win);
    const callback = vi.fn();
    const stop = subscribePending(callback);

    win.listeners.get('storage')();
    expect(callback).toHaveBeenCalledTimes(1);

    useLoginGateStore.getState().request({ type: 'save', payload: {}, returnTo: '/' });
    useLoginGateStore.getState().cancel();
    expect(callback).toHaveBeenCalledTimes(3);
    stop();
  });

  it('unsubscribes from both sources', () => {
    const win = fakeWindow();
    vi.stubGlobal('window', win);
    const callback = vi.fn();
    subscribePending(callback)();

    expect(win.listeners.has('storage')).toBe(false);
    useLoginGateStore.getState().cancel();
    expect(callback).not.toHaveBeenCalled();
  });
});

describe('handlePendingStorageEvent()', () => {
  const open = () => useLoginGateStore.getState().request({ type: 'save', payload: {}, returnTo: '/' });

  it('closes the sheet when another tab removed the pending action', () => {
    open();
    localStorage.removeItem('tibu.pendingAction'); // what the other tab did
    handlePendingStorageEvent({ key: 'tibu.pendingAction' });
    expect(useLoginGateStore.getState()).toMatchObject({ open: false, pending: null });
  });

  it('also reacts to storage.clear() (key null)', () => {
    open();
    localStorage.removeItem('tibu.pendingAction');
    handlePendingStorageEvent({ key: null });
    expect(useLoginGateStore.getState().open).toBe(false);
  });

  it('keeps the sheet while the persisted action still exists, and ignores other keys', () => {
    open();
    handlePendingStorageEvent({ key: 'tibu.pendingAction' });
    expect(useLoginGateStore.getState().open).toBe(true);
    localStorage.removeItem('tibu.pendingAction');
    handlePendingStorageEvent({ key: 'tibu.recent' });
    expect(useLoginGateStore.getState().open).toBe(true);
  });
});

describe('resumePending()', () => {
  it('keeps the original persisted draft when a replay handler rejects', async () => {
    const failed = Promise.reject(new Error('offline'));
    // The old implementation doesn't await the handler. Observe its rejection either way.
    void failed.catch(() => {});
    registerGateHandler('enquiry', () => failed);
    useLoginGateStore.getState().request({
      type: 'enquiry', payload: { body: 'Keep this draft' }, returnTo: '/p/p1',
    });
    const original = readRaw();

    await resumePending();

    expect(readRaw()).toEqual(original);
    expect(toast.error).toHaveBeenCalledOnce();
  });

  it('calls the registered handler with the pending action', async () => {
    const handler = vi.fn();
    registerGateHandler('whatsapp', handler);

    useLoginGateStore.getState().request({
      type: 'whatsapp',
      payload: { businessId: 'biz-1' },
      returnTo: '/b/ammas-kitchen',
    });

    await resumePending();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0]).toMatchObject({
      type: 'whatsapp',
      payload: { businessId: 'biz-1' },
    });
    // Entry must be removed from localStorage after resume
    expect(localStorage.getItem('tibu.pendingAction')).toBeNull();
  });

  it('does nothing when no pending action exists', async () => {
    const handler = vi.fn();
    registerGateHandler('call', handler);
    await resumePending();
    expect(handler).not.toHaveBeenCalled();
  });

  it('ignores an expired pending action (does not call handler, clears storage)', async () => {
    // Write an already-expired entry directly
    localStorage.setItem(
      'tibu.pendingAction',
      JSON.stringify({
        value: { type: 'whatsapp', payload: {}, returnTo: '/', createdAt: 1 },
        expiresAt: Date.now() - 1, // already expired
      }),
    );

    const handler = vi.fn();
    registerGateHandler('whatsapp', handler);

    await resumePending();

    expect(handler).not.toHaveBeenCalled();
    // getWithExpiry should have removed the stale entry
    expect(localStorage.getItem('tibu.pendingAction')).toBeNull();
  });

  it('clears the entry and does nothing when type has no registered handler (constraint c)', async () => {
    // 'save' has no handler registered yet
    useLoginGateStore.getState().request({
      type: 'save',
      payload: { id: 'prod-1', kind: 'product' },
      returnTo: '/p/prod-1',
    });

    await resumePending();
    // Entry must be cleared even without a handler
    expect(localStorage.getItem('tibu.pendingAction')).toBeNull();
  });

  it('preserves the action and toasts when a handler throws synchronously', async () => {
    registerGateHandler('call', () => {
      throw new Error('handler error');
    });

    useLoginGateStore.getState().request({
      type: 'call',
      payload: {},
      returnTo: '/',
    });

    const original = readRaw();
    await resumePending();
    expect(readRaw()).toEqual(original);
    expect(toast.error).toHaveBeenCalledOnce();
  });

  it('forwards context to the handler and resets store open/pending state', async () => {
    const handler = vi.fn();
    registerGateHandler('whatsapp', handler);

    useLoginGateStore.getState().request({
      type: 'whatsapp',
      payload: { id: 'biz-1' },
      returnTo: '/',
    });

    const fakeClient = { id: 'mock-query-client' };
    await resumePending(fakeClient);

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'whatsapp' }),
      fakeClient,
    );
    expect(useLoginGateStore.getState().open).toBe(false);
    expect(useLoginGateStore.getState().pending).toBeNull();
  });

  it('keeps the draft through a slow handler and ignores concurrent resumes', async () => {
    let finish;
    const handler = vi.fn(() => new Promise((resolve) => { finish = resolve; }));
    registerGateHandler('enquiry', handler);
    useLoginGateStore.getState().request({ type: 'enquiry', payload: { body: 'Hello' }, returnTo: '/' });
    const original = readRaw();
    const running = resumePending();
    await resumePending();
    expect(handler).toHaveBeenCalledOnce();
    expect(readRaw()).toEqual(original);
    finish();
    await running;
    expect(readRaw()).toBeNull();
  });

  it('skips replay when another tab holds the browser lock', async () => {
    const request = vi.fn(async (_key, _options, callback) => callback(null));
    vi.stubGlobal('navigator', { locks: { request } });
    const handler = vi.fn();
    registerGateHandler('enquiry', handler);
    useLoginGateStore.getState().request({ type: 'enquiry', payload: {}, returnTo: '/' });
    const original = readRaw();
    await resumePending();
    expect(request).toHaveBeenCalledWith('tibu.pendingAction', { ifAvailable: true }, expect.any(Function));
    expect(handler).not.toHaveBeenCalled();
    expect(readRaw()).toEqual(original);
  });

  it('does not clear a replacement draft when the original replay resolves', async () => {
    let finish;
    registerGateHandler('enquiry', () => new Promise((resolve) => { finish = resolve; }));
    const { request } = useLoginGateStore.getState();
    request({ type: 'enquiry', payload: { body: 'Old' }, returnTo: '/' });
    const running = resumePending();
    request({ type: 'enquiry', payload: { body: 'New' }, returnTo: '/' });
    const replacement = readRaw();
    finish();
    await running;
    expect(readRaw()).toEqual(replacement);
    expect(useLoginGateStore.getState()).toMatchObject({ open: true, pending: replacement.value });
  });

  it('retries the same unexpired in-memory draft on a later explicit attempt', async () => {
    vi.stubGlobal('localStorage', undefined);
    const handler = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    registerGateHandler('enquiry', handler);
    useLoginGateStore.getState().request({ type: 'enquiry', payload: { body: 'Hello' }, returnTo: '/' });
    const original = peekPending();
    await resumePending();
    expect(peekPending()).toBe(original);
    await resumePending();
    expect(handler).toHaveBeenCalledTimes(2);
    expect(peekPending()).toBeNull();
  });

  it('honours the expiry when the in-memory draft cannot be persisted', async () => {
    vi.stubGlobal('localStorage', undefined);
    const handler = vi.fn();
    registerGateHandler('enquiry', handler);
    useLoginGateStore.getState().request({ type: 'enquiry', payload: {}, returnTo: '/' });
    vi.spyOn(Date, 'now').mockReturnValue(peekPending().createdAt + 30 * 60 * 1000);
    await resumePending();
    expect(handler).not.toHaveBeenCalled();
    expect(peekPending()).toBeNull();
  });

  it('does not fall back to memory when another tab removed the persisted draft', async () => {
    const handler = vi.fn();
    registerGateHandler('enquiry', handler);
    useLoginGateStore.getState().request({ type: 'enquiry', payload: {}, returnTo: '/' });
    localStorage.removeItem('tibu.pendingAction');
    await resumePending();
    expect(handler).not.toHaveBeenCalled();
    expect(peekPending()).toBeNull();
  });
});
