import { z } from 'zod';
import { normalizeIndianMobile } from '../../lib/whatsapp';

/** Select value that asks the browser for the current position instead of naming an area. */
export const CURRENT_LOCATION = '__current';
export const CURRENT_LOCATION_LABEL = 'Current location';

/** 10-digit mobile as stored (CONTRACT §12), or null when empty/invalid. */
export function toTenDigitMobile(raw) {
  return normalizeIndianMobile(raw)?.slice(2) ?? null;
}

export const editProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter your name').max(80, 'Use 80 characters or fewer'),
  // Optional (Rev2: "name and phone/account information"); validated only when something is typed.
  phone: z
    .string()
    .trim()
    .refine((v) => v === '' || toTenDigitMobile(v) !== null, 'Enter a valid 10-digit Indian mobile number'),
  homeLocality: z.string(),
  homeLat: z.number().nullable(),
  homeLng: z.number().nullable(),
  notifyDigest: z.boolean(),
});

/**
 * Profile → form values.
 * @param {import('../../services/contract.js').Profile} profile
 */
export function profileToForm(profile) {
  return {
    fullName: profile.fullName ?? '',
    phone: profile.phone ?? '',
    homeLocality: profile.homeLocality ?? '',
    homeLat: profile.homeLat ?? null,
    homeLng: profile.homeLng ?? null,
    notifyDigest: !!profile.notifyDigest,
  };
}

/**
 * Parsed form values → `updateMe` patch (only CONTRACT §7 fields; never role, never avatarUrl —
 * uploadAvatar sets that itself).
 *
 * @param {z.infer<typeof editProfileSchema>} values
 */
export function formToPatch(values) {
  const locality = values.homeLocality.trim();
  const hasHome = locality !== '' && values.homeLat != null && values.homeLng != null;
  return {
    fullName: values.fullName.trim(),
    phone: values.phone.trim() === '' ? null : toTenDigitMobile(values.phone),
    homeLocality: hasHome ? locality : null,
    homeLat: hasHome ? values.homeLat : null,
    homeLng: hasHome ? values.homeLng : null,
    notifyDigest: values.notifyDigest,
  };
}

/** GPS coordinates rounded to 3 decimals (~100 m), the precision the location store also uses. */
export function roundCoord(value) {
  return Math.round(value * 1000) / 1000;
}

/**
 * Account rows shown under the header, by role.
 * TODO(B4.1): add "Sell on Tibu" (/sell, customers) and "Seller dashboard" (/seller, sellers) once those
 * pages exist — the legacy /seller/register screen (fake OTP) must not be reachable from here.
 *
 * @param {'customer'|'seller'|'admin'|null|undefined} role null for a guest
 * @returns {Array<{ key: string, label: string, to: string }>}
 */
export function accountRows(role) {
  if (!role) return [{ key: 'recent', label: 'Recently viewed', to: '/recent' }];
  const rows = [
    { key: 'saved', label: 'Saved', to: '/saved' },
    { key: 'recent', label: 'Recently viewed', to: '/recent' },
    { key: 'connected', label: 'Previously connected', to: '/connected' },
    { key: 'notifications', label: 'Notification settings', to: '/notifications/settings' },
  ];
  if (role === 'admin') rows.push({ key: 'admin', label: 'Admin panel', to: '/admin' });
  return rows;
}

/** Help and legal rows, the same for guests and members. */
export const INFO_ROWS = [
  { key: 'help', label: 'Help', to: '/help' },
  { key: 'about', label: 'About Tibu', to: '/about' },
  { key: 'privacy', label: 'Privacy', to: '/privacy' },
  { key: 'terms', label: 'Terms', to: '/terms' },
];
