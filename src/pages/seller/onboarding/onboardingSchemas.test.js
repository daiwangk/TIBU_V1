import { describe, expect, it } from 'vitest';
import { basicsSchema, contactSchema, locationSchema, toTenDigitMobile, videoSchema } from './onboardingSchemas.js';

const firstError = (result) => result.error?.issues[0]?.message;

describe('basicsSchema', () => {
  const ok = { name: 'Sweet Crumbs', categorySlug: 'desserts', description: 'Cakes', establishedYear: '' };

  it('accepts a complete step', () => {
    expect(basicsSchema.safeParse(ok).success).toBe(true);
    expect(basicsSchema.safeParse({ ...ok, establishedYear: '2019' }).success).toBe(true);
  });

  it('requires a name of 2–80 characters, a category and a description of at most 2000', () => {
    expect(basicsSchema.safeParse({ ...ok, name: 'A' }).success).toBe(false);
    expect(basicsSchema.safeParse({ ...ok, name: 'x'.repeat(81) }).success).toBe(false);
    expect(basicsSchema.safeParse({ ...ok, categorySlug: '' }).success).toBe(false);
    expect(basicsSchema.safeParse({ ...ok, description: '  ' }).success).toBe(false);
    expect(basicsSchema.safeParse({ ...ok, description: 'x'.repeat(2001) }).success).toBe(false);
  });

  it('limits the year to 1900 up to this year', () => {
    const thisYear = new Date().getFullYear();
    expect(basicsSchema.safeParse({ ...ok, establishedYear: '1900' }).success).toBe(true);
    expect(basicsSchema.safeParse({ ...ok, establishedYear: String(thisYear) }).success).toBe(true);
    for (const year of ['1899', String(thisYear + 1), '20x9', '201']) {
      expect(firstError(basicsSchema.safeParse({ ...ok, establishedYear: year })), year).toBe(
        `Enter a year between 1900 and ${thisYear}`,
      );
    }
  });
});

describe('locationSchema', () => {
  const ok = {
    locality: 'Bandra West',
    lat: 19.059,
    lng: 72.829,
    addressText: '',
    city: 'Mumbai',
    deliveryAvailable: true,
    pickupAvailable: false,
    deliveryTime: 'Same day',
  };

  it('accepts a located business', () => {
    expect(locationSchema.safeParse(ok).success).toBe(true);
  });

  it('needs an area and coordinates', () => {
    expect(locationSchema.safeParse({ ...ok, locality: '' }).success).toBe(false);
    expect(locationSchema.safeParse({ ...ok, lat: null }).success).toBe(false);
    expect(locationSchema.safeParse({ ...ok, lng: null }).success).toBe(false);
  });

  it('caps the address at 300 and the delivery time at 40 characters', () => {
    expect(locationSchema.safeParse({ ...ok, addressText: 'x'.repeat(301) }).success).toBe(false);
    expect(locationSchema.safeParse({ ...ok, deliveryTime: 'x'.repeat(41) }).success).toBe(false);
    expect(locationSchema.safeParse({ ...ok, deliveryTime: 'x'.repeat(40) }).success).toBe(true);
  });
});

describe('contactSchema', () => {
  const ok = { phone: '98765 43210', sameAsPhone: true, whatsapp: '', instagramHandle: '@tibu.shop' };

  it('accepts the phone alone while WhatsApp is "same as phone"', () => {
    expect(contactSchema.safeParse(ok).success).toBe(true);
  });

  it('validates the WhatsApp number only when it is entered separately', () => {
    expect(contactSchema.safeParse({ ...ok, sameAsPhone: false, whatsapp: '12345' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, sameAsPhone: false, whatsapp: '+91 91234 56789' }).success).toBe(true);
  });

  it('rejects bad phones and Instagram handles', () => {
    expect(contactSchema.safeParse({ ...ok, phone: '5123456789' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, instagramHandle: '' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, instagramHandle: 'not a handle' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, instagramHandle: 'https://instagram.com/tibu' }).success).toBe(true);
  });
});

describe('toTenDigitMobile', () => {
  it('stores the 10-digit form', () => {
    expect(toTenDigitMobile('+91 98765 43210')).toBe('9876543210');
    expect(toTenDigitMobile('0123')).toBeNull();
  });
});

describe('videoSchema', () => {
  it('accepts a public reel link with an optional caption', () => {
    expect(videoSchema.safeParse({ instagramUrl: 'https://www.instagram.com/reel/Cookie_123/', caption: '' }).success).toBe(true);
    expect(videoSchema.safeParse({ instagramUrl: ' https://instagram.com/reels/Cookie_123?igsh=x ', caption: 'Baking day' }).success).toBe(true);
  });

  it('rejects other links and long captions', () => {
    for (const instagramUrl of ['', 'https://instagram.com/tibu', 'https://youtube.com/reel/Cookie_123', 'not a link']) {
      expect(videoSchema.safeParse({ instagramUrl, caption: '' }).success, instagramUrl).toBe(false);
    }
    expect(videoSchema.safeParse({ instagramUrl: 'https://www.instagram.com/reel/Cookie_123/', caption: 'x'.repeat(201) }).success).toBe(false);
  });
});
