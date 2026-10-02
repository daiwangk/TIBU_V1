/**
 * WhatsApp and phone link helpers — docs/CONTRACT.md §10.
 */
import { formatPrice } from './format.js';

/**
 * Normalise an Indian mobile number for use in international links.
 * Returns `'91'` + 10 digits for `wa.me` / `tel:` (CONTRACT §10).
 * DB writes (CONTRACT §12) must store the 10-digit form only — strip the leading `91`.
 *
 * @param {string|number} number
 * @returns {string|null} e.g. `'919876543210'`, or `null` if invalid
 */
export function normalizeIndianMobile(number) {
  let digits = String(number ?? '').replace(/\D/g, '');
  digits = digits.replace(/^00/, '');
  if (digits.startsWith('91')) digits = digits.slice(2);
  digits = digits.replace(/^0+/, '');

  return /^[6-9]\d{9}$/.test(digits) ? `91${digits}` : null;
}

/**
 * @param {{ name: string, price: number }} product
 * @param {string} url
 * @returns {string}
 */
export function productMessage({ name, price }, url) {
  return `Hi! I discovered your business through Tibu and I'm interested in your ${name} (${formatPrice(price)}). I'd like to know more.\n${url}`;
}

/**
 * @param {{ name: string }} business
 * @param {string} url
 * @returns {string}
 */
export function businessMessage({ name }, url) {
  return `Hi! I discovered ${name} through Tibu and I'd like to know more.\n${url}`;
}

/**
 * @param {string|number} number
 * @param {string} text
 * @returns {string|null}
 */
export function whatsappLink(number, text) {
  const mobile = normalizeIndianMobile(number);
  return mobile ? `https://wa.me/${mobile}?text=${encodeURIComponent(text)}` : null;
}

/**
 * @param {string|number} number
 * @returns {string|null}
 */
export function callLink(number) {
  const mobile = normalizeIndianMobile(number);
  return mobile ? `tel:+${mobile}` : null;
}
