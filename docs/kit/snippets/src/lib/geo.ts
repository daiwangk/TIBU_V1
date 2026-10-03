// src/lib/geo.ts — customer location (free: browser Geolocation API)
export type LatLng = { lat: number; lng: number };

export function getBrowserLocation(timeoutMs = 8000): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('unsupported'));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => reject(e),
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 10 * 60 * 1000 },
    );
  });
}

/** Fallback when permission is denied: customer picks an area. Extend as sellers onboard. */
export const MUMBAI_AREAS: Record<string, LatLng> = {
  'Andheri West': { lat: 19.1364, lng: 72.8296 },
  'Bandra West':  { lat: 19.0596, lng: 72.8295 },
  'Juhu':         { lat: 19.1075, lng: 72.8263 },
  'Powai':        { lat: 19.1176, lng: 72.9060 },
  'Colaba':       { lat: 18.9067, lng: 72.8147 },
  'Dadar':        { lat: 19.0178, lng: 72.8478 },
  'Malad West':   { lat: 19.1874, lng: 72.8484 },
  'Thane West':   { lat: 19.2183, lng: 72.9781 },
};
// Store the chosen location in a Zustand store + localStorage (key: tibu.location)
// and pass it to search_businesses / search_products as p_lat / p_lng.
