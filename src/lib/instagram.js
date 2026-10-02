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
