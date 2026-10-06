/**
 * Route prefixes where the BottomNav is hidden (detail, seller and dev screens).
 * Matches from the start of the pathname. Shared by AppShell (bottom padding) and BottomNav.
 */
const HIDDEN_PREFIXES = ['/p/', '/b/', '/seller/', '/dev/'];

/** @param {string} pathname */
export function isBottomNavHidden(pathname) {
  return HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
