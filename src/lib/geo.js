import { AppError } from '../services/errors.js';

const EARTH_RADIUS_METERS = 6_371_000;

/**
 * Fallback areas when browser location permission is unavailable.
 * Duplicated in `scripts/seed-dev.mjs` (`AREAS`) — keep both lists in sync.
 * @type {ReadonlyArray<{ name: string, lat: number, lng: number }>}
 */
export const MUMBAI_AREAS = Object.freeze([
  { name: 'Andheri West', lat: 19.1364, lng: 72.8296 },
  { name: 'Bandra West', lat: 19.0596, lng: 72.8295 },
  { name: 'Juhu', lat: 19.1075, lng: 72.8263 },
  { name: 'Powai', lat: 19.1176, lng: 72.906 },
  { name: 'Malad West', lat: 19.1874, lng: 72.8484 },
  { name: 'Borivali West', lat: 19.2288, lng: 72.8544 },
  { name: 'Versova', lat: 19.132, lng: 72.8172 },
  { name: 'Khar West', lat: 19.0726, lng: 72.8362 },
  { name: 'Santacruz West', lat: 19.083, lng: 72.841 },
  { name: 'Goregaon West', lat: 19.1663, lng: 72.8491 },
]);

/**
 * @param {{ lat: number, lng: number }} a
 * @param {{ lat: number, lng: number }} b
 * @returns {number}
 */
export function haversineMeters(a, b) {
  const radians = Math.PI / 180;
  const latDelta = (b.lat - a.lat) * radians;
  const lngDelta = (b.lng - a.lng) * radians;
  const haversine = Math.sin(latDelta / 2) ** 2
    + Math.cos(a.lat * radians) * Math.cos(b.lat * radians) * Math.sin(lngDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

/**
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<{ lat: number, lng: number }>}
 */
export function getBrowserLocation({ timeoutMs = 10_000 } = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new AppError('validation', 'Location is not supported by this browser.'));
      return;
    }

    const onError = (error) => {
      const message = error?.code === 1
        ? 'Location permission was denied.'
        : error?.code === 3
          ? 'Location request timed out.'
          : 'Unable to get your location.';
      reject(new AppError('validation', message, error));
    };

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        onError,
        { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 10 * 60 * 1000 },
      );
    } catch (error) {
      reject(new AppError('validation', 'Unable to get your location.', error));
    }
  });
}
