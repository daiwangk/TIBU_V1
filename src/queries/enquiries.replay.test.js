/**
 * Replayed 'enquiry' gate action — src/queries/enquiries.replay.test.js
 *
 * Verifies that when an unauthenticated guest drafts an enquiry, logs in,
 * and resumePending() executes:
 *   1. sendEnquiry() is called with the draft payload
 *   2. Caches for thread, threads lists, myThread, and unread are invalidated
 *   3. Navigation to /enquiries/<threadId> is triggered
 *   4. The persisted action is cleared
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendEnquiry = vi.fn();
vi.mock('../services/index.js', () => ({
  sendEnquiry: (...args) => sendEnquiry(...args),
  findMyThread: vi.fn(),
  listMyThreads: vi.fn(),
  getThread: vi.fn(),
  sendMessage: vi.fn(),
  markThreadRead: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('window', {
    location: { assign: vi.fn() },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

const { resumePending, useLoginGateStore } = await import('../stores/loginGate.js');
const { enquiryGateAction } = await import('./enquiries.js'); // registers 'enquiry' gate handler
const { qk } = await import('./keys.js');

describe("replayed 'enquiry' gate action", () => {
  it('calls sendEnquiry, invalidates caches, and navigates to the new thread', async () => {
    sendEnquiry.mockResolvedValue('thread-456');
    const queryClient = {
      invalidateQueries: vi.fn(() => Promise.resolve()),
      navigate: vi.fn(),
    };

    useLoginGateStore.getState().request(
      enquiryGateAction({
        businessId: 'biz-1',
        productId: 'prod-1',
        body: 'Do you make custom cakes?',
        returnTo: '/p/prod-1',
      }),
    );

    resumePending(queryClient);

    await vi.waitFor(() => expect(sendEnquiry).toHaveBeenCalled());

    expect(sendEnquiry).toHaveBeenCalledWith({
      businessId: 'biz-1',
      productId: 'prod-1',
      body: 'Do you make custom cakes?',
    });

    await vi.waitFor(() => {
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: qk.thread('thread-456'),
      });
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['threads'],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: qk.myThread('biz-1'),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: qk.unread,
    });

    expect(queryClient.navigate).toHaveBeenCalledWith('/enquiries/thread-456');
    expect(localStorage.getItem('tibu.pendingAction')).toBeNull();
  });

  it('navigates via window.location.assign if queryClient.navigate is not present', async () => {
    sendEnquiry.mockResolvedValue('thread-789');
    const queryClient = {
      invalidateQueries: vi.fn(() => Promise.resolve()),
    };

    useLoginGateStore.getState().request(
      enquiryGateAction({
        businessId: 'biz-2',
        body: 'Hello',
      }),
    );

    resumePending(queryClient);

    await vi.waitFor(() => expect(sendEnquiry).toHaveBeenCalled());
    expect(window.location.assign).toHaveBeenCalledWith('/enquiries/thread-789');
  });

  it('silently ignores missing or invalid payload without throwing', async () => {
    useLoginGateStore.getState().request({
      type: 'enquiry',
      payload: { businessId: '', body: '' },
      returnTo: '/',
    });

    expect(() => resumePending(null)).not.toThrow();
    expect(sendEnquiry).not.toHaveBeenCalled();
  });
});
