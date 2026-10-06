import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectSearchOrigin, toOrigin, useLocationStore } from './location.js';
import * as geo from '../lib/geo.js';
import { AppError } from '../services/errors.js';

vi.mock('../lib/geo.js', () => ({
  getBrowserLocation: vi.fn(),
  MUMBAI_AREAS: [
    { name: 'Andheri West', lat: 19.1364, lng: 72.8296 },
    { name: 'Bandra West', lat: 19.0596, lng: 72.8295 },
  ],
}));

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
  };
}

async function flushPersist() {
  await Promise.resolve();
  await Promise.resolve();
}

function persistedLocation() {
  const raw = localStorage.getItem('tibu.location');
  return raw ? JSON.parse(raw) : null;
}

describe('location store', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    toOrigin(null, null);
    useLocationStore.setState({
      lat: null,
      lng: null,
      label: null,
      source: null,
      asked: false,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('store actions', () => {
    it('initializes with null state', () => {
      const state = useLocationStore.getState();
      expect(state.lat).toBeNull();
      expect(state.lng).toBeNull();
      expect(state.label).toBeNull();
      expect(state.source).toBeNull();
      expect(state.asked).toBe(false);
    });

    it('requestGps sets location correctly', async () => {
      geo.getBrowserLocation.mockResolvedValueOnce({ lat: 10, lng: 20 });
      await useLocationStore.getState().requestGps();

      const state = useLocationStore.getState();
      expect(state.lat).toBe(10);
      expect(state.lng).toBe(20);
      expect(state.label).toBe('Current location');
      expect(state.source).toBe('gps');
      expect(state.asked).toBe(true);
    });

    it('setArea sets predefined area', () => {
      useLocationStore.getState().setArea('Bandra West');

      const state = useLocationStore.getState();
      expect(state.lat).toBe(19.0596);
      expect(state.lng).toBe(72.8295);
      expect(state.label).toBe('Bandra West');
      expect(state.source).toBe('area');
      expect(state.asked).toBe(true);
    });

    it('setArea throws AppError on unknown area', () => {
      expect(() => {
        useLocationStore.getState().setArea('Unknown City');
      }).toThrowError(AppError);
    });

    it('setFromProfile sets profile location', () => {
      useLocationStore.getState().setFromProfile({ lat: 12.34, lng: 56.78, label: 'My Home' });

      const state = useLocationStore.getState();
      expect(state.lat).toBe(12.34);
      expect(state.lng).toBe(56.78);
      expect(state.label).toBe('My Home');
      expect(state.source).toBe('profile');
    });

    it('clear resets coords but keeps asked', () => {
      useLocationStore.setState({
        lat: 1,
        lng: 2,
        label: 'foo',
        source: 'gps',
        asked: true,
      });
      useLocationStore.getState().clear();

      const state = useLocationStore.getState();
      expect(state.lat).toBeNull();
      expect(state.lng).toBeNull();
      expect(state.label).toBeNull();
      expect(state.source).toBeNull();
      expect(state.asked).toBe(true);
    });

    it('markAsked sets asked to true', () => {
      useLocationStore.getState().markAsked();
      expect(useLocationStore.getState().asked).toBe(true);
    });
  });

  describe('persist', () => {
    it('writes asked with the rest of the location state', async () => {
      useLocationStore.getState().setArea('Bandra West');
      await flushPersist();

      expect(persistedLocation()?.state).toMatchObject({
        lat: 19.0596,
        lng: 72.8295,
        label: 'Bandra West',
        source: 'area',
        asked: true,
      });
    });

    it('keeps asked in storage after clear', async () => {
      useLocationStore.getState().markAsked();
      useLocationStore.getState().setArea('Andheri West');
      useLocationStore.getState().clear();
      await flushPersist();

      expect(persistedLocation()?.state).toMatchObject({
        lat: null,
        lng: null,
        label: null,
        source: null,
        asked: true,
      });
    });
  });

  describe('toOrigin / selectSearchOrigin (useSearchOrigin logic)', () => {
    it('returns null when lat or lng is null', () => {
      expect(toOrigin(null, null)).toBeNull();
      expect(toOrigin(10, null)).toBeNull();
      expect(toOrigin(null, 20)).toBeNull();
    });

    it('returns object when lat and lng are provided', () => {
      expect(toOrigin(10, 20)).toEqual({ lat: 10, lng: 20 });
    });

    it('keeps the same object identity while coordinates are unchanged', () => {
      useLocationStore.getState().setArea('Bandra West');
      const first = selectSearchOrigin(useLocationStore.getState());

      useLocationStore.getState().markAsked();
      useLocationStore.setState({ label: 'Near Bandra West' });
      const second = selectSearchOrigin(useLocationStore.getState());

      expect(first).toEqual({ lat: 19.0596, lng: 72.8295 });
      expect(second).toBe(first);
    });

    it('allocates a new origin when coordinates change', () => {
      useLocationStore.getState().setArea('Bandra West');
      const bandra = selectSearchOrigin(useLocationStore.getState());

      useLocationStore.getState().setArea('Andheri West');
      const andheri = selectSearchOrigin(useLocationStore.getState());

      expect(andheri).toEqual({ lat: 19.1364, lng: 72.8296 });
      expect(andheri).not.toBe(bandra);
    });
  });
});
