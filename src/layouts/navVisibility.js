/**
 * Route prefixes where the BottomNav is hidden (detail, seller, auth and dev screens).
 * Matches from the start of the pathname. Shared by AppShell (bottom padding) and BottomNav.
 */
const HIDDEN_PREFIXES = ['/p/', '/b/', '/seller/', '/dev/', '/login', '/signup', '/forgot-password', '/reset-password', '/auth/', '/enquiries/'];

/** @param {string} pathname */
export function isBottomNavHidden(pathname) {
  return pathname === '/seller' || HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
