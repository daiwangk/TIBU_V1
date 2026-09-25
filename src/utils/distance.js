/**
 * Haversine formula to calculate distance between two coordinates in meters.
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} distance in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const toRad = (val) => (val * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats a distance in meters to a human-readable string.
 * @param {number} meters 
 * @returns {string} 
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    // Round to nearest 100m for simplicity, or just return meters if accurate
    return `${Math.round(meters / 100) * 100} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// Mock User Location (Bandra West, Mumbai)
export const MOCK_USER_LOCATION = {
  lat: 19.0596,
  lng: 72.8295,
};
