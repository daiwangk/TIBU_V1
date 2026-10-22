const SHORTCODE = /^[A-Za-z0-9_-]{5,40}$/;
const CONTENT_TYPES = new Set(['reel', 'reels', 'p', 'tv']);

/**
 * Extract an Instagram content shortcode from a public Instagram URL.
 *
 * @param {string} url
 * @returns {string|null}
 */
export function parseInstagramShortcode(url) {
  if (typeof url !== 'string') return null;

  try {
    const parsed = new URL(url.trim());
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'instagram.com' && !hostname.endsWith('.instagram.com')) return null;

    const parts = parsed.pathname.split('/').filter(Boolean);
    const typeIndex = parts.findIndex((part) => CONTENT_TYPES.has(part.toLowerCase()));
    const shortcode = typeIndex === -1 ? null : parts[typeIndex + 1];
    return shortcode && SHORTCODE.test(shortcode) ? shortcode : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} shortcode
 * @returns {string|null}
 */
export function reelEmbedUrl(shortcode) {
  if (typeof shortcode !== 'string' || !SHORTCODE.test(shortcode)) return null;
  return `https://www.instagram.com/reel/${shortcode}/embed`;
}

const HANDLE = /^[A-Za-z0-9._]{1,30}$/;
const NOT_A_PROFILE = new Set(['p', 'reel', 'reels', 'tv', 'explore', 'stories']);

/**
 * A bare Instagram handle from what a seller typed: `@tibu`, `tibu` or a profile URL
 * (`instagram.com/tibu/`). CONTRACT §12: `^[A-Za-z0-9._]{1,30}$`.
 *
 * @param {string} raw
 * @returns {string|null} the handle, or null if it is empty or not a profile handle
 */
export function normalizeInstagramHandle(raw) {
  if (typeof raw !== 'string') return null;
  let handle = raw.trim();
  if (/instagram\.com/i.test(handle)) {
    try {
      const url = new URL(/^https?:\/\//i.test(handle) ? handle : `https://${handle}`);
      handle = url.pathname.split('/').filter(Boolean)[0] ?? '';
    } catch {
      return null;
    }
    if (NOT_A_PROFILE.has(handle.toLowerCase())) return null;
  }
  handle = handle.replace(/^@/, '');
  return HANDLE.test(handle) ? handle : null;
}
