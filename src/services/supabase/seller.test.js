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
  buildBusinessImagePath,
  buildProductImagePath,
  getStoragePathFromUrl,
  validateCompressedSize,
  validateImageFile,
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

describe('seller image pure helpers', () => {
  describe('validateImageFile', () => {
    it('throws validation error if file is missing or null', () => {
      expect(() => validateImageFile(null)).toThrow(AppError);
      expect(() => validateImageFile(undefined)).toThrow('Please select an image file');
      expect(() => validateImageFile('not-a-file')).toThrow('Please select an image file');
    });

    it('throws validation error if mime type does not start with image/', () => {
      expect(() => validateImageFile({ type: 'application/pdf', size: 1000 })).toThrow(AppError);
      expect(() => validateImageFile({ type: 'application/pdf', size: 1000 })).toThrow('Please upload a valid image file');
      expect(() => validateImageFile({ type: 'text/plain', size: 1000 })).toThrow('Please upload a valid image file');
      expect(() => validateImageFile({ type: '', size: 1000 })).toThrow('Please upload a valid image file');
    });

    it('throws validation error if raw file is greater than 10 MB', () => {
      const tenMbPlusOne = 10 * 1024 * 1024 + 1;
      expect(() => validateImageFile({ type: 'image/jpeg', size: tenMbPlusOne })).toThrow(AppError);
      expect(() => validateImageFile({ type: 'image/jpeg', size: tenMbPlusOne })).toThrow('Image must be under 10 MB');
    });

    it('accepts valid image files <= 10 MB', () => {
      expect(() => validateImageFile({ type: 'image/webp', size: 5 * 1024 * 1024 })).not.toThrow();
      expect(() => validateImageFile({ type: 'image/jpeg', size: 10 * 1024 * 1024 })).not.toThrow();
      expect(() => validateImageFile({ type: 'image/png', size: 1024 })).not.toThrow();
    });
  });

  describe('validateCompressedSize', () => {
    it('throws validation error if compressed file exceeds 3 MB bucket limit', () => {
      const threeMbPlusOne = 3 * 1024 * 1024 + 1;
      expect(() => validateCompressedSize({ size: threeMbPlusOne })).toThrow(AppError);
      expect(() => validateCompressedSize({ size: threeMbPlusOne })).toThrow('Compressed image exceeds the 3 MB limit');
    });

    it('accepts compressed files <= 3 MB', () => {
      expect(() => validateCompressedSize({ size: 3 * 1024 * 1024 })).not.toThrow();
      expect(() => validateCompressedSize({ size: 200 * 1024 })).not.toThrow();
    });
  });

  describe('buildBusinessImagePath', () => {
    const businessId = 'biz-uuid-123';
    const timestamp = 1729500000000;
    const uuid = 'img-uuid-456';

    it('builds logo path as {businessId}/logo-<ts>.webp', () => {
      const path = buildBusinessImagePath(businessId, 'logo', { timestamp, uuid });
      expect(path).toBe('biz-uuid-123/logo-1729500000000.webp');
    });

    it('builds banner path as {businessId}/banner-<ts>.webp', () => {
      const path = buildBusinessImagePath(businessId, 'banner', { timestamp, uuid });
      expect(path).toBe('biz-uuid-123/banner-1729500000000.webp');
    });

    it('builds gallery path as {businessId}/gallery/<uuid>.webp', () => {
      const path = buildBusinessImagePath(businessId, 'gallery', { timestamp, uuid });
      expect(path).toBe('biz-uuid-123/gallery/img-uuid-456.webp');
    });

    it('throws validation error for invalid businessId or unknown kind', () => {
      expect(() => buildBusinessImagePath('', 'logo')).toThrow('Business ID is required');
      expect(() => buildBusinessImagePath(businessId, 'unknown')).toThrow('Invalid image kind: unknown');
    });
  });

  describe('buildProductImagePath', () => {
    const businessId = 'biz-uuid-123';
    const productId = 'prod-uuid-789';
    const uuid = 'img-uuid-999';

    it('builds product path as {businessId}/products/{productId}/<uuid>.webp', () => {
      const path = buildProductImagePath(businessId, productId, { uuid });
      expect(path).toBe('biz-uuid-123/products/prod-uuid-789/img-uuid-999.webp');
    });

    it('throws validation error when businessId or productId is missing', () => {
      expect(() => buildProductImagePath('', productId)).toThrow('Business ID is required');
      expect(() => buildProductImagePath(businessId, '')).toThrow('Product ID is required');
    });
  });

  describe('getStoragePathFromUrl', () => {
    it('extracts relative path from standard Supabase storage public URL', () => {
      const url = 'https://abcxyz.supabase.co/storage/v1/object/public/business-media/biz-1/gallery/uuid-1.webp';
      expect(getStoragePathFromUrl(url)).toBe('biz-1/gallery/uuid-1.webp');
    });

    it('strips query parameters and hashes from URL', () => {
      const url = 'https://abcxyz.supabase.co/storage/v1/object/public/business-media/biz-1/logo-123.webp?v=456#main';
      expect(getStoragePathFromUrl(url)).toBe('biz-1/logo-123.webp');
    });

    it('handles relative bucket paths with or without leading slash', () => {
      expect(getStoragePathFromUrl('/business-media/biz-1/banner-123.webp')).toBe('biz-1/banner-123.webp');
      expect(getStoragePathFromUrl('business-media/biz-1/banner-123.webp')).toBe('biz-1/banner-123.webp');
    });

    it('handles already-clean paths', () => {
      expect(getStoragePathFromUrl('biz-1/products/prod-1/img.webp')).toBe('biz-1/products/prod-1/img.webp');
      expect(getStoragePathFromUrl('/biz-1/products/prod-1/img.webp')).toBe('biz-1/products/prod-1/img.webp');
    });

    it('returns empty string for null, undefined, or empty url', () => {
      expect(getStoragePathFromUrl(null)).toBe('');
      expect(getStoragePathFromUrl(undefined)).toBe('');
      expect(getStoragePathFromUrl('')).toBe('');
    });
  });
});

