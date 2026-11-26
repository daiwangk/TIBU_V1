import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth.js';
import { selectVisibleLocation, useLocationStore } from '../stores/location.js';
import { resolveProfileLocationDefault } from '../lib/profileLocation.js';
import { startAuthSync } from './authSync.js';

const A = { userId: 'u1', email: 'a@b.co' };
const B = { userId: 'u2', email: 'b@b.co' };
const AREA_A = { lat: 19.1, lng: 72.8, label: 'Area A', ownerId: A.userId };
const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

function setup(overrides = {}) {
  let listener = () => {};
  const unsubscribe = vi.fn();
  const deps = {
    dataSource: 'supabase',
    getSession: vi.fn().mockResolvedValue(null),
    onAuthChange: vi.fn((cb) => { listener = cb; return unsubscribe; }),
    queryClient: { cancelQueries: vi.fn(), clear: vi.fn(), invalidateQueries: vi.fn() },
    setSession: (s) => useAuthStore.getState().setSession(s),
    ...overrides,
  };
  return { deps, emit: (...args) => listener(...args), unsubscribe };
}

beforeEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true);
  useLocationStore.setState(useLocationStore.getInitialState(), true);
});

afterEach(() => vi.unstubAllGlobals());

describe('startAuthSync', () => {
  it('applies B’s own home area after A signs out', () => {
    const { deps, emit } = setup();
    const stop = startAuthSync(deps);
    const profileA = { id: A.userId, homeLat: 19.1, homeLng: 72.8, homeLocality: 'Area A' };
    const profileB = { id: B.userId, homeLat: 19.2, homeLng: 72.9, homeLocality: 'Area B' };

    function applyProfile(profile) {
      const location = useLocationStore.getState();
      const area = resolveProfileLocationDefault(location, profile);
      if (area) location.setFromProfile({ ...area, ownerId: profile.id });
    }

    try {
      emit(A, 'SIGNED_IN');
      applyProfile(profileA);
      expect(useLocationStore.getState().label).toBe('Area A');
      emit(null, 'SIGNED_OUT');
      expect(useLocationStore.getState()).toMatchObject({ label: null, source: null, profileOwnerId: null });
      emit(B, 'SIGNED_IN');
      applyProfile(profileB);
      expect(useLocationStore.getState()).toMatchObject({ label: 'Area B', profileOwnerId: B.userId });
    } finally {
      stop();
      useLocationStore.getState().clear();
    }
  });

  it('clears a different owner’s home area before publishing a direct account switch', () => {
    const { deps, emit } = setup();
    const stop = startAuthSync(deps);
    const seen = vi.fn();
    const unsubscribe = useAuthStore.subscribe(({ session }) => {
      if (session?.userId === B.userId) seen(useLocationStore.getState().label);
    });
    try {
      emit(A, 'SIGNED_IN');
      useLocationStore.getState().setFromProfile(AREA_A);
      emit(B, 'SIGNED_IN');
      expect(seen).toHaveBeenCalledExactlyOnceWith(null);
    } finally {
      unsubscribe();
      stop();
    }
  });

  it.each(['gps', 'area'])('keeps an explicit %s choice on guest restore, sign-in and sign-out', (source) => {
    useLocationStore.setState({ lat: 19, lng: 73, source, label: 'Device choice' });
    const { deps, emit } = setup();
    const stop = startAuthSync(deps);
    const explicit = useLocationStore.getState();
    try {
      emit(null, 'INITIAL_SESSION');
      expect(selectVisibleLocation(useLocationStore.getState(), null)).toBe(explicit);
      emit(A, 'SIGNED_IN');
      emit(B, 'SIGNED_IN');
      emit(null, 'SIGNED_OUT');
      expect(selectVisibleLocation(useLocationStore.getState(), null)).toBe(explicit);
    } finally {
      stop();
    }
  });

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
    expect(useAuthStore.getState().sessionVersion).toBe(0);

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

  it('SIGNED_OUT clears the cache and advances the session version once', () => {
    const { deps, emit } = setup();
    startAuthSync(deps);
    emit(A, 'SIGNED_IN');
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().sessionVersion).toBe(0);
    deps.queryClient.clear.mockClear();
    deps.queryClient.cancelQueries.mockClear();
    emit(null, 'SIGNED_OUT');
    emit(null, 'SIGNED_OUT');
    expect(deps.queryClient.cancelQueries).toHaveBeenCalledTimes(1);
    expect(deps.queryClient.clear).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState()).toMatchObject({ status: 'guest', session: null, sessionVersion: 1 });
  });

  it('same-user SIGNED_IN refetches the profile and keeps the session version', () => {
    const { deps, emit } = setup();
    startAuthSync(deps);
    emit(A, 'SIGNED_IN');
    deps.queryClient.clear.mockClear();
    deps.queryClient.cancelQueries.mockClear();
    emit({ ...A, email: 'new@example.invalid' }, 'SIGNED_IN');
    expect(deps.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['me'] });
    expect(deps.queryClient.clear).not.toHaveBeenCalled();
    expect(deps.queryClient.cancelQueries).not.toHaveBeenCalled();
    expect(useAuthStore.getState().sessionVersion).toBe(0);
  });

  it('TOKEN_REFRESHED keeps the cache and session version and skips profile refetch', () => {
    const { deps, emit } = setup();
    startAuthSync(deps);
    emit(A, 'SIGNED_IN');
    deps.queryClient.clear.mockClear();
    deps.queryClient.cancelQueries.mockClear();
    emit(A, 'TOKEN_REFRESHED');
    expect(deps.queryClient.invalidateQueries).not.toHaveBeenCalled();
    expect(deps.queryClient.clear).not.toHaveBeenCalled();
    expect(deps.queryClient.cancelQueries).not.toHaveBeenCalled();
    expect(useAuthStore.getState().sessionVersion).toBe(0);
  });

  it('a same-user token refresh keeps the same visible home area without a location update', () => {
    const { deps, emit } = setup();
    const stop = startAuthSync(deps);
    emit(A, 'SIGNED_IN');
    useLocationStore.getState().setFromProfile(AREA_A);
    const original = useLocationStore.getState();
    const changed = vi.fn();
    const unsubscribe = useLocationStore.subscribe(changed);
    try {
      emit({ ...A }, 'TOKEN_REFRESHED');
      expect(selectVisibleLocation(useLocationStore.getState(), A.userId)).toBe(original);
      expect(changed).not.toHaveBeenCalled();
    } finally {
      unsubscribe();
      stop();
    }
  });

  it.each([A, B, null])('restores saved home area only for its owner after reload (%j)', async (session) => {
    const memory = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => memory.set(key, value),
      removeItem: (key) => memory.delete(key),
    });
    memory.set('tibu.location', JSON.stringify({
      state: { lat: AREA_A.lat, lng: AREA_A.lng, label: AREA_A.label, source: 'profile', profileOwnerId: A.userId },
      version: 2,
    }));
    await useLocationStore.persist.rehydrate();

    const restored = useLocationStore.getState();
    expect(restored.label).toBe('Area A');
    expect(selectVisibleLocation(restored, undefined)).toBeUndefined();
    const observed = vi.fn();
    const unsubscribe = useLocationStore.subscribe(observed);
    const { deps } = setup({ getSession: vi.fn().mockResolvedValue(session) });
    const stop = startAuthSync(deps);
    try {
      await flush();
      const location = useLocationStore.getState();
      if (session === A) {
        expect(selectVisibleLocation(location, A.userId)).toBe(restored);
        expect(observed).not.toHaveBeenCalled();
      } else {
        expect(selectVisibleLocation(location, session?.userId ?? null)).toMatchObject({ label: null, lat: null, lng: null });
        expect(JSON.parse(memory.get('tibu.location')).state.profileOwnerId).toBeNull();
      }
    } finally {
      stop();
      unsubscribe();
    }
  });

  it('switching A to B removes cached data and cancels a late query before publishing B', async () => {
    const client = new QueryClient();
    const { deps, emit } = setup({ queryClient: client });
    const stop = startAuthSync(deps);
    let resolveQuery;
    try {
      emit(A, 'SIGNED_IN');
      client.setQueryData(['myBusiness'], { id: 'A-shop' });
      const observed = [];
      const unsubscribe = useAuthStore.subscribe(({ session }) => {
        if (session?.userId === B.userId) observed.push(client.getQueryData(['myBusiness']));
      });
      const pending = client.fetchQuery({
        queryKey: ['saved'],
        queryFn: () => new Promise((resolve) => { resolveQuery = resolve; }),
      }).catch((error) => error);

      emit(B, 'SIGNED_IN');
      unsubscribe();
      resolveQuery({ businessIds: ['A-shop'] });
      expect(await pending).toBeInstanceOf(Error);
      expect(observed).toEqual([undefined]);
      expect(client.getQueryData(['saved'])).toBeUndefined();
      expect(useAuthStore.getState().sessionVersion).toBe(1);
    } finally {
      stop();
      client.clear();
    }
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
