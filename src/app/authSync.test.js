import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../stores/auth.js';
import { startAuthSync } from './authSync.js';

const A = { userId: 'u1', email: 'a@b.co' };
const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

function setup(overrides = {}) {
  let listener = () => {};
  const unsubscribe = vi.fn();
  const deps = {
    dataSource: 'supabase',
    getSession: vi.fn().mockResolvedValue(null),
    onAuthChange: vi.fn((cb) => { listener = cb; return unsubscribe; }),
    queryClient: { clear: vi.fn(), invalidateQueries: vi.fn() },
    setSession: (s) => useAuthStore.getState().setSession(s),
    ...overrides,
  };
  return { deps, emit: (...args) => listener(...args), unsubscribe };
}

beforeEach(() => {
  useAuthStore.setState({ status: 'loading', session: null });
});

describe('startAuthSync', () => {
  it('mock mode: guest straight away and Supabase is never called', () => {
    const { deps } = setup({ dataSource: 'mock' });
    const stop = startAuthSync(deps);
    expect(useAuthStore.getState().status).toBe('guest');
    expect(deps.getSession).not.toHaveBeenCalled();
    expect(deps.onAuthChange).not.toHaveBeenCalled();
    expect(typeof stop).toBe('function');
  });

  it('restores a saved session, or becomes a guest', async () => {
    const signedIn = setup({ getSession: vi.fn().mockResolvedValue(A) });
    startAuthSync(signedIn.deps);
    expect(useAuthStore.getState().status).toBe('loading');
    await flush();
    expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', session: A });

    useAuthStore.setState({ status: 'loading', session: null });
    startAuthSync(setup().deps);
    await flush();
    expect(useAuthStore.getState().status).toBe('guest');
  });

  it('a failing getSession leaves the user a guest, not stuck on loading', async () => {
    startAuthSync(setup({ getSession: vi.fn().mockRejectedValue(new Error('offline')) }).deps);
    await flush();
    expect(useAuthStore.getState().status).toBe('guest');
  });

  it('SIGNED_OUT clears every cached query and returns to guest', async () => {
    const { deps, emit } = setup();
    startAuthSync(deps);
    emit(A, 'SIGNED_IN');
    expect(useAuthStore.getState().status).toBe('authenticated');
    emit(null, 'SIGNED_OUT');
    expect(deps.queryClient.clear).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState()).toMatchObject({ status: 'guest', session: null });
  });

  it('SIGNED_IN refetches the profile; a token refresh does neither', () => {
    const { deps, emit } = setup();
    startAuthSync(deps);
    emit(A, 'SIGNED_IN');
    expect(deps.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['me'] });
    deps.queryClient.invalidateQueries.mockClear();
    emit(A, 'TOKEN_REFRESHED');
    expect(deps.queryClient.invalidateQueries).not.toHaveBeenCalled();
    expect(deps.queryClient.clear).not.toHaveBeenCalled();
  });

  it('an auth event that arrives first is not overwritten by a late getSession answer', async () => {
    let resolveSession;
    const { deps, emit } = setup({ getSession: vi.fn(() => new Promise((r) => { resolveSession = r; })) });
    startAuthSync(deps);
    emit(A, 'SIGNED_IN');
    resolveSession(null);
    await flush();
    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('stop unsubscribes and ignores later events', () => {
    const { deps, emit, unsubscribe } = setup();
    const stop = startAuthSync(deps);
    stop();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    emit(null, 'SIGNED_OUT');
    expect(deps.queryClient.clear).not.toHaveBeenCalled();
  });

  it('missing Supabase config means guest, not a crash', () => {
    startAuthSync(setup({ onAuthChange: vi.fn(() => { throw new Error('config'); }) }).deps);
    expect(useAuthStore.getState().status).toBe('guest');
  });
});

describe('auth store', () => {
  it('keeps the same session object across token refreshes', () => {
    useAuthStore.getState().setSession(A);
    const first = useAuthStore.getState().session;
    useAuthStore.getState().setSession({ ...A });
    expect(useAuthStore.getState().session).toBe(first);
  });
});
