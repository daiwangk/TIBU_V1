/**
 * Guest taps save → logs in → the replayed 'save' action really saves (setSaved with saved: true).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';

const setSaved = vi.fn();
vi.mock('../services/index.js', () => ({
  getSavedIds: vi.fn(),
  listSavedBusinesses: vi.fn(),
  listSavedProducts: vi.fn(),
  setSaved: (...args) => setSaved(...args),
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
});

const { resumePending, useLoginGateStore } = await import('../stores/loginGate.js');
await import('./saved.js'); // registers the 'save' gate handler
const { saveGateAction } = await import('../lib/savedHelpers.js');
const { qk } = await import('./keys.js');

describe("replayed 'save' gate action", () => {
  it('calls setSaved with saved: true and refreshes the saved caches', async () => {
    setSaved.mockResolvedValue(undefined);
    const queryClient = { invalidateQueries: vi.fn(() => Promise.resolve()) };

    useLoginGateStore.getState().request(saveGateAction('product', 'p-1', '/p/p-1'));
    await resumePending(queryClient);

    expect(setSaved).toHaveBeenCalledWith({ kind: 'product', id: 'p-1', saved: true });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: qk.saved });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: qk.savedProducts });
    expect(localStorage.getItem('tibu.pendingAction')).toBeNull();
  });

  it('works for businesses too', async () => {
    setSaved.mockResolvedValue(undefined);
    useLoginGateStore.getState().request(saveGateAction('business', 'b-1', '/b/sweet-crumbs'));
    await resumePending(null);
    expect(setSaved).toHaveBeenCalledWith({ kind: 'business', id: 'b-1', saved: true });
  });

  it('retains a save action when its request fails', async () => {
    setSaved.mockRejectedValueOnce(new Error('offline'));
    useLoginGateStore.getState().request(saveGateAction('product', 'p-1', '/p/p-1'));
    const original = localStorage.getItem('tibu.pendingAction');
    await resumePending();
    expect(localStorage.getItem('tibu.pendingAction')).toBe(original);
    expect(toast.error).toHaveBeenCalledOnce();
  });
});
