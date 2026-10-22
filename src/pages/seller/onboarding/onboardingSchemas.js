import { z } from 'zod';
import { normalizeInstagramHandle, parseInstagramShortcode } from '../../../lib/instagram.js';
import { normalizeIndianMobile } from '../../../lib/whatsapp.js';

/** 10-digit mobile as stored (CONTRACT §12), or null when invalid. */
export function toTenDigitMobile(raw) {
  return normalizeIndianMobile(raw)?.slice(2) ?? null;
}

/** Usual delivery times offered as chips (D37); "Other" lets the seller type their own. */
export const DELIVERY_TIME_PRESETS = ['Same day', 'Next day', '2–3 days', 'Within a week'];

const MOBILE_MESSAGE = 'Enter a valid 10-digit Indian mobile number';

/** Step 1. `establishedYear` stays a string (it is an input field); empty means not stated. */
export const basicsSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters').max(80, 'Use 80 characters or fewer'),
  categorySlug: z.string().min(1, 'Choose a category'),
  description: z.string().trim().min(1, 'Tell customers about your business').max(2000, 'Use 2000 characters or fewer'),
  establishedYear: z.string().trim().refine((v) => {
    if (v === '') return true;
    const year = Number(v);
    return /^\d{4}$/.test(v) && year >= 1900 && year <= new Date().getFullYear();
  }, { error: () => `Enter a year between 1900 and ${new Date().getFullYear()}` }),
});

/** Step 2. */
export const locationSchema = z.object({
  locality: z.string().trim().min(1, 'Choose your area or use your location'),
  lat: z.number().nullable().refine((v) => v != null, 'Choose your area or use your location'),
  lng: z.number().nullable().refine((v) => v != null, 'Choose your area or use your location'),
  addressText: z.string().trim().max(300, 'Use 300 characters or fewer'),
  city: z.string().trim().min(1, 'Enter your city').max(60, 'Use 60 characters or fewer'),
  deliveryAvailable: z.boolean(),
  pickupAvailable: z.boolean(),
  deliveryTime: z.string().trim().max(40, 'Use 40 characters or fewer'),
});

/** Step 3. WhatsApp is ignored (copied from the phone) while `sameAsPhone` is set. */
export const contactSchema = z
  .object({
    phone: z.string().trim().refine((v) => toTenDigitMobile(v) !== null, MOBILE_MESSAGE),
    sameAsPhone: z.boolean(),
    whatsapp: z.string().trim(),
    instagramHandle: z
      .string()
      .trim()
      .refine((v) => normalizeInstagramHandle(v) !== null, 'Enter your Instagram handle, like tibu.shop'),
  })
  .superRefine((values, ctx) => {
    if (!values.sameAsPhone && toTenDigitMobile(values.whatsapp) === null) {
      ctx.addIssue({ code: 'custom', path: ['whatsapp'], message: MOBILE_MESSAGE });
    }
  });

/** Step 6: one reel to add. */
export const videoSchema = z.object({
  instagramUrl: z
    .string()
    .trim()
    .refine((v) => parseInstagramShortcode(v) !== null, "That doesn't look like a public Instagram reel link"),
  caption: z.string().trim().max(200, 'Keep the caption to 200 characters'),
});
