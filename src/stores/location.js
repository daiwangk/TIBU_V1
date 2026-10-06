import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getBrowserLocation, MUMBAI_AREAS } from '../lib/geo.js';
import { AppError } from '../services/errors.js';

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
 * @returns {{ lat: number|null, lng: number|null, label: string|null, source: string|null, asked: boolean }}
 */
export function sanitizePersistedLocation(persisted) {
  const p = persisted && typeof persisted === 'object' ? /** @type {Record<string, unknown>} */ (persisted) : {};
  const located = validCoords(p.lat, p.lng);
  return {
    lat: located ? /** @type {number} */ (p.lat) : null,
    lng: located ? /** @type {number} */ (p.lng) : null,
    label: located && typeof p.label === 'string' && p.label ? p.label : null,
    source: located && typeof p.source === 'string' && SOURCES.has(p.source) ? p.source : null,
    asked: p.asked === true,
  };
}

/** Bumped by every action that sets or clears the location, so a slow GPS answer can't overwrite a newer choice. */
let locationVersion = 0;

export const useLocationStore = create(
  persist(
    (set) => ({
      lat: null,
      lng: null,
      label: null,
      source: null,
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
          asked: true,
        });
      },

      setArea: (name) => {
        const area = MUMBAI_AREAS.find((a) => a.name === name);
        if (!area) {
          throw new AppError('validation', 'Unknown area selected.');
        }
        locationVersion += 1;
        set({ lat: area.lat, lng: area.lng, label: area.name, source: 'area', asked: true });
      },

      setFromProfile: ({ lat, lng, label }) => {
        locationVersion += 1;
        set({ lat, lng, label, source: 'profile' });
      },

      clear: () => {
        locationVersion += 1;
        set({ lat: null, lng: null, label: null, source: null });
      },

      markAsked: () => {
        set({ asked: true });
      },
    }),
    {
      name: 'tibu.location',
      version: 1,
      storage: createJSONStorage(() => guardedStorage),
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
  return useLocationStore(selectSearchOrigin);
}
