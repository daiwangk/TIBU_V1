/**
 * Public site origin for links that leave the app (auth e-mails, WhatsApp messages): `VITE_SITE_URL`
 * without trailing slashes, else the page's own origin (local dev).
 *
 * @returns {string} e.g. "https://tibu-app.pages.dev"
 */
export function siteUrl() {
  const configured = String(import.meta.env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, '');
  if (configured) return configured;
  return typeof window === 'undefined' ? '' : window.location.origin;
}
