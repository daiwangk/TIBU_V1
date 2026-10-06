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

export const useLocationStore = create(
  persist(
    (set) => ({
      lat: null,
      lng: null,
      label: null,
      source: null,
      asked: false,

      requestGps: async () => {
        const { lat, lng } = await getBrowserLocation();
        set({ lat, lng, label: 'Current location', source: 'gps', asked: true });
      },

      setArea: (name) => {
        const area = MUMBAI_AREAS.find((a) => a.name === name);
        if (!area) {
          throw new AppError('validation', 'Unknown area selected.');
        }
        set({ lat: area.lat, lng: area.lng, label: area.name, source: 'area', asked: true });
      },

      setFromProfile: ({ lat, lng, label }) => {
        set({ lat, lng, label, source: 'profile' });
      },

      clear: () => {
        set({ lat: null, lng: null, label: null, source: null });
      },

      markAsked: () => {
        set({ asked: true });
      },
    }),
    {
      name: 'tibu.location',
      storage: createJSONStorage(() => guardedStorage),
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
