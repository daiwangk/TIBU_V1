/**
 * Decision logic for defaulting search location from user profile.
 *
 * Requirements:
 * - When location store has no location (lat/lng null, source null)
 * - Profile has non-null homeLat and homeLng
 * - Returns { lat, lng, label: homeLocality ?? 'Home area' }
 * - Skips (returns null) when a location already exists or coords are null/missing
 */

/**
 * @param {{ lat: number|null, lng: number|null, source: string|null }|null|undefined} location
 * @param {{ homeLat?: number|null, homeLng?: number|null, homeLocality?: string|null }|null|undefined} profile
 * @returns {{ lat: number, lng: number, label: string }|null}
 */
export function resolveProfileLocationDefault(location, profile) {
  if (!location) return null;
  // Never overwrite any location the user already set (gps, area, profile) or any non-null coordinates
  if (location.lat != null || location.lng != null || location.source != null) {
    return null;
  }

  if (!profile) return null;
  const { homeLat, homeLng, homeLocality } = profile;

  if (homeLat == null || homeLng == null) return null;
  if (typeof homeLat !== 'number' || typeof homeLng !== 'number' || !Number.isFinite(homeLat) || !Number.isFinite(homeLng)) {
    return null;
  }

  return {
    lat: homeLat,
    lng: homeLng,
    label: homeLocality ?? 'Home area',
  };
}
