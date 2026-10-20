import { describe, expect, it } from 'vitest';
import {
  buildSubmitChecklist,
  deliveryOverrideToColumns,
  generateBusinessSlug,
  mapDeliveryOverride,
  mapMyProduct,
  slugifyName,
  SUBMIT_CHECKLIST_ITEMS,
  toEstablishedYear,
  toDeliveryTime,
} from './seller.js';
import { AppError } from '../errors.js';

describe('slug generation', () => {
  it('slugifies the name and appends a 4-char base36 suffix', () => {
    expect(generateBusinessSlug('Sweet Crumbs', '7k2p')).toBe('sweet-crumbs-7k2p');
    expect(generateBusinessSlug("Amma's Kitchen", 'ab09')).toBe('amma-s-kitchen-ab09');
  });

  it('falls back to shop when the name has no ascii letters', () => {
    expect(slugifyName('!!!')).toBe('shop');
    expect(generateBusinessSlug('   ', 'zzzz')).toBe('shop-zzzz');
  });

  it('builds a contract slug when the suffix is generated', () => {
    expect(generateBusinessSlug('Needle & Knot')).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*-[a-z0-9]{4}$/);
  });
});

describe('submit checklist', () => {
  it('lists every key with the B4.2 step numbers when there is no business', () => {
    expect(buildSubmitChecklist(null)).toEqual({
      ok: false,
      missing: SUBMIT_CHECKLIST_ITEMS,
    });
    expect(SUBMIT_CHECKLIST_ITEMS.map((i) => i.key)).toEqual([
      'category',
      'description',
      'location',
      'contacts',
      'instagram_handle',
      'logo',
      'at_least_one_product',
      'product_image',
    ]);
    expect(SUBMIT_CHECKLIST_ITEMS.find((i) => i.key === 'logo').step).toBe(4);
    expect(SUBMIT_CHECKLIST_ITEMS.find((i) => i.key === 'location').step).toBe(2);
    expect(SUBMIT_CHECKLIST_ITEMS.find((i) => i.key === 'contacts').step).toBe(3);
  });

  it('mirrors the RPC null checks and adds product_image (D29)', () => {
    const row = {
      category_id: 1,
      description: '',
      logo_url: null,
      location: { type: 'Point' },
      instagram_handle: 'aura',
      business_contacts: { phone: '9876543210', whatsapp: '9876543210' },
      products: [{ is_active: true, product_images: [] }],
    };
    const { ok, missing } = buildSubmitChecklist(row);
    expect(ok).toBe(false);
    expect(missing.map((m) => m.key)).toEqual(['logo', 'product_image']);
  });

  it('requires the image to belong to an active product', () => {
    const missing = buildSubmitChecklist({
      category_id: 1,
      description: 'Home bakery',
      logo_url: 'https://x/logo.webp',
      location: { type: 'Point' },
      instagram_handle: 'aura',
      business_contacts: { phone: '9876543210', whatsapp: '9876543210' },
      products: [
        { is_active: true, product_images: [] },
        { is_active: false, product_images: [{ url: 'https://x/inactive.webp' }] },
      ],
    }).missing;
    expect(missing.map((item) => item.key)).toEqual(['product_image']);
  });

  it('treats an empty description as present (SQL only checks NULL)', () => {
    const missing = buildSubmitChecklist({
      category_id: 1,
      description: '',
      logo_url: 'https://x/logo.webp',
      location: {},
      instagram_handle: 'x',
      business_contacts: { phone: '9', whatsapp: '9' },
      products: [{ is_active: true, product_images: [{ url: 'https://x/p.webp' }] }],
    }).missing;
    expect(missing).toEqual([]);
  });

  it('returns ok when every RPC field and a product image are present', () => {
    expect(buildSubmitChecklist({
      category_id: 3,
      description: 'Home bakery',
      logo_url: 'https://x/logo.webp',
      lat: 19.06,
      lng: 72.83,
      location: { type: 'Point' },
      instagram_handle: 'crumbs',
      business_contacts: { phone: '9876543210', whatsapp: '9876543210' },
      products: [{ is_active: true, product_images: [{ id: 'i1', url: 'https://x/p.webp' }] }],
    })).toEqual({ ok: true, missing: [] });
  });
});

describe('deliveryOverride helpers', () => {
  it('writes explicit nulls for all three columns when override is null', () => {
    expect(deliveryOverrideToColumns(null)).toEqual({
      delivery_available: null,
      pickup_available: null,
      delivery_time: null,
    });
  });

  it('writes the three object values and turns an empty deliveryTime into null', () => {
    expect(deliveryOverrideToColumns({
      deliveryAvailable: false,
      pickupAvailable: true,
      deliveryTime: '  ',
    })).toEqual({
      delivery_available: false,
      pickup_available: true,
      delivery_time: null,
    });
  });

  it('returns null when all three product columns are NULL', () => {
    expect(mapDeliveryOverride(
      { delivery_available: null, pickup_available: null, delivery_time: null },
      { delivery_available: true, pickup_available: true, delivery_time: 'Same day' },
    )).toBeNull();
  });

  it('uses ?? so false is kept and does not fall through to the shop', () => {
    expect(mapDeliveryOverride(
      { delivery_available: false, pickup_available: null, delivery_time: null },
      { delivery_available: true, pickup_available: true, delivery_time: 'Same day' },
    )).toEqual({
      deliveryAvailable: false,
      pickupAvailable: true,
      deliveryTime: null,
    });
  });
});

describe('mapMyProduct', () => {
  it('keeps inactive products and reuses public product fields', () => {
    const business = {
      id: 'b1',
      slug: 'sweet',
      name: 'Sweet Crumbs',
      locality: 'Bandra West',
      city: 'Mumbai',
      logo_url: null,
      banner_url: null,
      available_today: false,
      delivery_available: true,
      pickup_available: true,
      delivery_time: 'Same day',
      rating_avg: 0,
      rating_count: 0,
      categories: { slug: 'desserts', name: 'Desserts' },
    };
    const mapped = mapMyProduct({
      id: 'p1',
      name: 'Cookies',
      price_paise: 35000,
      description: 'Batch',
      details: [{ label: 'Weight', value: '500g' }],
      available_today: false,
      is_active: false,
      created_at: '2026-01-01T00:00:00Z',
      sort_order: 2,
      product_images: [{ id: 'i1', url: 'https://x/p.webp', sort_order: 0 }],
      categories: { slug: 'desserts' },
      delivery_available: null,
      pickup_available: null,
      delivery_time: null,
    }, business);

    expect(mapped).toMatchObject({
      id: 'p1',
      name: 'Cookies',
      price: 350,
      isActive: false,
      sortOrder: 2,
      deliveryOverride: null,
      deliveryAvailable: true,
      pickupAvailable: true,
      deliveryTime: 'Same day',
    });
  });
});

describe('established year and delivery time', () => {
  it('trims delivery time and maps empty to null', () => {
    expect(toDeliveryTime(' Same day ')).toBe('Same day');
    expect(toDeliveryTime('')).toBeNull();
    expect(toDeliveryTime(null)).toBeNull();
  });

  it('accepts 1900 through the current year and maps empty to null', () => {
    const current = new Date().getFullYear();
    expect(toEstablishedYear('')).toBeNull();
    expect(toEstablishedYear(null)).toBeNull();
    expect(toEstablishedYear(1900)).toBe(1900);
    expect(toEstablishedYear(current)).toBe(current);
  });

  it('rejects a year outside 1900..current', () => {
    const current = new Date().getFullYear();
    expect(() => toEstablishedYear(1899)).toThrow(AppError);
    expect(() => toEstablishedYear(current + 1)).toThrow(
      `Enter a year between 1900 and ${current}`,
    );
  });
});
