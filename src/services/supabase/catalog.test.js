import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSupabaseMock } = vi.hoisted(() => ({ getSupabaseMock: vi.fn() }));

vi.mock('./client.js', () => ({ getSupabase: getSupabaseMock }));

import {
  buildSearchArgs,
  getBusinessBySlug,
  getProductById,
  listReviews,
  searchProducts,
} from './catalog.js';

const VALID_PRODUCT_ID = '11111111-1111-4111-8111-111111111111';

function createSingleQuery(calls) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn((column, value) => {
      calls.push([column, value]);
      return query;
    }),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
  };
  return query;
}

describe('buildSearchArgs', () => {
  it('always sends p_available_today as a boolean', () => {
    expect(buildSearchArgs({}).p_available_today).toBe(false);
    expect(buildSearchArgs({ availableToday: false }).p_available_today).toBe(false);
    expect(buildSearchArgs({ availableToday: true }).p_available_today).toBe(true);
  });

  it('passes an empty-string sort through unchanged', () => {
    expect(buildSearchArgs({ sort: '' }).p_sort).toBe('');
  });

  it('omits p_radius_km when undefined and sends null when null', () => {
    expect(buildSearchArgs({})).not.toHaveProperty('p_radius_km');
    expect(buildSearchArgs({ radiusKm: undefined })).not.toHaveProperty('p_radius_km');
    expect(buildSearchArgs({ radiusKm: null }).p_radius_km).toBeNull();
    expect(buildSearchArgs({ radiusKm: 5 }).p_radius_km).toBe(5);
  });

  it('caps p_limit at 50 and maps near + price', () => {
    expect(buildSearchArgs({ limit: 100 }).p_limit).toBe(50);
    expect(buildSearchArgs({ limit: 10, offset: 20 }).p_limit).toBe(10);
    expect(buildSearchArgs({ offset: 20 }).p_offset).toBe(20);

    const withNear = buildSearchArgs({
      near: { lat: 19.1, lng: 72.8 },
      minPrice: 100,
      maxPrice: 350,
    }, 'product');
    expect(withNear.p_lat).toBe(19.1);
    expect(withNear.p_lng).toBe(72.8);
    expect(withNear.p_sort).toBe('distance');
    expect(withNear.p_min_price_paise).toBe(10000);
    expect(withNear.p_max_price_paise).toBe(35000);

    const withoutNear = buildSearchArgs({}, 'business');
    expect(withoutNear.p_lat).toBeNull();
    expect(withoutNear.p_lng).toBeNull();
    expect(withoutNear.p_sort).toBe('newest');
  });
});

describe('catalog visibility guards', () => {
  beforeEach(() => {
    getSupabaseMock.mockReset();
  });

  it('filters business details to approved businesses in the query', async () => {
    const calls = [];
    const query = createSingleQuery(calls);
    getSupabaseMock.mockReturnValue({ from: vi.fn(() => query) });

    await expect(getBusinessBySlug('sweet-crumbs')).resolves.toBeNull();

    expect(calls).toEqual([
      ['slug', 'sweet-crumbs'],
      ['status', 'approved'],
    ]);
  });

  it('filters product details to active products from approved businesses in the query', async () => {
    const calls = [];
    const query = createSingleQuery(calls);
    const from = vi.fn(() => query);
    getSupabaseMock.mockReturnValue({ from });

    await expect(getProductById(VALID_PRODUCT_ID)).resolves.toBeNull();

    expect(from).toHaveBeenCalledWith('products');
    expect(query.select.mock.calls[0][0]).toContain('businesses!inner');
    expect(calls).toEqual([
      ['id', VALID_PRODUCT_ID],
      ['is_active', true],
      ['businesses.status', 'approved'],
    ]);
  });

  it('returns null for non-uuid product ids without calling Supabase', async () => {
    await expect(getProductById('nope')).resolves.toBeNull();
    expect(getSupabaseMock).not.toHaveBeenCalled();
  });

  it('returns an empty list for non-uuid business ids without calling Supabase', async () => {
    await expect(listReviews('nope')).resolves.toEqual([]);
    expect(getSupabaseMock).not.toHaveBeenCalled();
  });

  it('maps PGRST116 on product detail to null', async () => {
    const query = createSingleQuery([]);
    query.maybeSingle = vi.fn(async () => ({
      data: null,
      error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' },
    }));
    getSupabaseMock.mockReturnValue({ from: vi.fn(() => query) });

    await expect(getProductById(VALID_PRODUCT_ID)).resolves.toBeNull();
    expect(getSupabaseMock).toHaveBeenCalled();
  });

  it('rejects an unsupported businessId filter before querying Supabase', async () => {
    await expect(searchProducts({ businessId: 'business-id' })).rejects.toMatchObject({
      code: 'validation',
      message: 'businessId filter not supported by supabase adapter yet',
    });
    expect(getSupabaseMock).not.toHaveBeenCalled();
  });
});
