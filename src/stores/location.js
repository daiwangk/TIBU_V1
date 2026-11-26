import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getBrowserLocation, MUMBAI_AREAS } from '../lib/geo.js';
import { AppError } from '../services/errors.js';
import { useAuthStore } from './auth.js';

const guardedStorage = {
  getItem: (name) => {
    try {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(name, value);
    } catch {
      return;
    }
  },
  removeItem: (name) => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(name);
    } catch {
      return;
    }
  },
};

const SOURCES = new Set(['gps', 'area', 'profile']);
const EMPTY_LOCATION = { lat: null, lng: null, label: null, source: null, profileOwnerId: null };

/** GPS fixes are rounded to 3 decimals (~110 m): enough for distances, and query keys stop churning as you walk. */
const roundCoord = (n) => Math.round(n * 1000) / 1000;

const validCoords = (lat, lng) =>
  typeof lat === 'number' && typeof lng === 'number'
  && Number.isFinite(lat) && Number.isFinite(lng)
  && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

/**
 * Keep only well-formed values from whatever was stored in localStorage.
 * Coordinates are all-or-nothing; anything else falls back to the empty state.
 * @param {unknown} persisted
 * @returns {{ lat: number|null, lng: number|null, label: string|null, source: string|null, profileOwnerId: string|null, asked: boolean }}
 */
export function sanitizePersistedLocation(persisted) {
  const p = persisted && typeof persisted === 'object' ? /** @type {Record<string, unknown>} */ (persisted) : {};
  const owner = typeof p.profileOwnerId === 'string' && p.profileOwnerId ? p.profileOwnerId : null;
  const located = validCoords(p.lat, p.lng) && (p.source !== 'profile' || owner !== null);
  const source = located && typeof p.source === 'string' && SOURCES.has(p.source) ? p.source : null;
  return {
    lat: located ? /** @type {number} */ (p.lat) : null,
    lng: located ? /** @type {number} */ (p.lng) : null,
    label: located && typeof p.label === 'string' && p.label ? p.label : null,
    source,
    profileOwnerId: source === 'profile' ? owner : null,
    asked: p.asked === true,
  };
}

/** A slow GPS result must not overwrite a more recent explicit device choice. */
let locationVersion = 0;

export const useLocationStore = create(
  persist(
    (set, get) => ({
      ...EMPTY_LOCATION,
      asked: false,

      requestGps: async () => {
        const startedAt = ++locationVersion;
        const { lat, lng } = await getBrowserLocation();
        // The user picked an area, cleared, or asked again while GPS was thinking — theirs wins.
        if (startedAt !== locationVersion) return;
        set({
          lat: roundCoord(lat),
          lng: roundCoord(lng),
          label: 'Current location',
          source: 'gps',
          profileOwnerId: null,
          asked: true,
        });
      },

      setArea: (name) => {
        const area = MUMBAI_AREAS.find((a) => a.name === name);
        if (!area) {
          throw new AppError('validation', 'Unknown area selected.');
        }
        locationVersion += 1;
        set({ lat: area.lat, lng: area.lng, label: area.name, source: 'area', profileOwnerId: null, asked: true });
      },

      setFromProfile: ({ lat, lng, label, ownerId }) => {
        if (!ownerId) return;
        set({ lat, lng, label, source: 'profile', profileOwnerId: ownerId });
      },

      reconcileProfileOwner: (userId) => {
        const { source, profileOwnerId } = get();
        if (source === 'profile' && (!userId || profileOwnerId !== userId)) set(EMPTY_LOCATION);
      },

      clear: () => {
        locationVersion += 1;
        set(EMPTY_LOCATION);
      },

      markAsked: () => {
        set({ asked: true });
      },
    }),
    {
      name: 'tibu.location',
      version: 2,
      storage: createJSONStorage(() => guardedStorage),
      migrate: sanitizePersistedLocation,
      merge: (persisted, current) => ({ ...current, ...sanitizePersistedLocation(persisted) }),
    },
  ),
);

/** Same `{ lat, lng }` object until coordinates change — otherwise query keys churn. */
let originCache = null;

/**
 * @param {number|null|undefined} lat
 * @param {number|null|undefined} lng
 * @returns {{ lat: number, lng: number }|null}
 */
export function toOrigin(lat, lng) {
  if (lat == null || lng == null) {
    originCache = null;
    return null;
  }
  if (originCache && originCache.lat === lat && originCache.lng === lng) {
    return originCache;
  }
  originCache = { lat, lng };
  return originCache;
}

/**
 * @param {{ lat: number|null, lng: number|null }} state
 * @returns {{ lat: number, lng: number }|null}
 */
export function selectSearchOrigin(state) {
  return toOrigin(state.lat, state.lng);
}

export function useSearchOrigin() {
  return useVisibleLocation(selectSearchOrigin) ?? null;
}

/** Undefined means auth is restoring an owner. Null means there is no signed-in user. */
export function selectVisibleLocation(state, userId) {
  if (state.source !== 'profile') return state;
  if (userId === undefined) return undefined;
  return userId && state.profileOwnerId === userId ? state : EMPTY_LOCATION;
}

export function useVisibleLocation(selector) {
  const userId = useAuthStore((auth) => auth.status === 'loading' ? undefined : auth.session?.userId ?? null);
  return useLocationStore((state) => {
    const visible = selectVisibleLocation(state, userId);
    return visible && selector(visible);
  });
}
