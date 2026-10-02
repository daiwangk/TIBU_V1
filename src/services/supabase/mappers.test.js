import { describe, expect, it } from 'vitest';
import {
  mapBusinessDetail,
  mapDetails,
  mapProductDetail,
  mapProductSummaryFromSearch,
  paiseToRupees,
} from './mappers.js';

/** Recursively collect object keys. */
function allKeys(value, out = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => allKeys(item, out));
    return out;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      out.add(k);
      allKeys(v, out);
    }
  }
  return out;
}

describe('supabase mappers', () => {
  it('rounds price_paise to integer rupees', () => {
    expect(paiseToRupees(35000)).toBe(350);
    expect(paiseToRupees(129950)).toBe(1300);
    expect(mapProductSummaryFromSearch({
      id: 'p1',
      name: 'Cookies',
      price_paise: 35000,
      image_url: null,
      available_today: false,
      business_id: 'b1',
      business_slug: 'sweet',
      business_name: 'Sweet',
      business_logo_url: null,
      locality: 'Bandra West',
      rating_avg: 4.5,
      category_slug: 'desserts',
      created_at: '2026-01-01T00:00:00Z',
    }).price).toBe(350);
  });

  it('maps details jsonb object to [{ label, value }]', () => {
    expect(mapDetails({ weight: '500g', serves: '4' })).toEqual([
      { label: 'weight', value: '500g' },
      { label: 'serves', value: '4' },
    ]);
  });

  it('sets distanceM null when distance_m is absent', () => {
    const summary = mapProductSummaryFromSearch({
      id: 'p1',
      name: 'Cookies',
      price_paise: 10000,
      image_url: null,
      available_today: false,
      business_id: 'b1',
      business_slug: 'sweet',
      business_name: 'Sweet',
      business_logo_url: null,
      locality: 'Bandra West',
      rating_avg: 0,
      category_slug: 'desserts',
      created_at: '2026-01-01T00:00:00Z',
    });
    expect(summary.distanceM).toBeNull();
  });

  it('prefers RPC distance_m to a supplied haversine fallback for summaries and details', () => {
    const summary = mapProductSummaryFromSearch({
      id: 'p1',
      name: 'Cookies',
      price_paise: 10000,
      image_url: null,
      available_today: false,
      business_id: 'b1',
      business_slug: 'sweet',
      business_name: 'Sweet',
      business_logo_url: null,
      locality: 'Bandra West',
      rating_avg: 0,
      category_slug: 'desserts',
      created_at: '2026-01-01T00:00:00Z',
      distance_m: 125,
    }, 500);
    expect(summary.distanceM).toBe(125);

    const detail = mapBusinessDetail({
      id: 'b1',
      slug: 'sweet',
      name: 'Sweet',
      description: '',
      address_text: '',
      locality: 'Bandra West',
      city: 'Mumbai',
      logo_url: null,
      banner_url: null,
      available_today: false,
      delivery_available: false,
      pickup_available: false,
      rating_avg: 0,
      rating_count: 0,
      approved_at: null,
      distance_m: 125,
      categories: { slug: 'desserts', name: 'Desserts' },
      business_images: [],
      business_videos: [],
      products: [],
    }, 500);
    expect(detail.distanceM).toBe(125);

    const productDetail = mapProductDetail({
      id: 'p1',
      name: 'Cookies',
      price_paise: 10000,
      description: '',
      details: {},
      available_today: false,
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      distance_m: 125,
      product_images: [],
      categories: { slug: 'desserts' },
      businesses: {
        id: 'b1',
        slug: 'sweet',
        name: 'Sweet',
        locality: 'Bandra West',
        city: 'Mumbai',
        logo_url: null,
        banner_url: null,
        available_today: false,
        delivery_available: false,
        pickup_available: false,
        rating_avg: 0,
        rating_count: 0,
        approved_at: null,
        categories: { slug: 'desserts', name: 'Desserts' },
      },
    }, 500);
    expect(productDetail.distanceM).toBe(125);
  });

  it('sets distanceM to null when neither RPC distance nor fallback exists for summaries and details', () => {
    const summary = mapProductSummaryFromSearch({
      id: 'p1',
      name: 'Cookies',
      price_paise: 10000,
      image_url: null,
      available_today: false,
      business_id: 'b1',
      business_slug: 'sweet',
      business_name: 'Sweet',
      business_logo_url: null,
      locality: 'Bandra West',
      rating_avg: 0,
      category_slug: 'desserts',
      created_at: '2026-01-01T00:00:00Z',
    });
    expect(summary.distanceM).toBeNull();

    const detail = mapProductDetail({
      id: 'p1',
      name: 'Cookies',
      price_paise: 10000,
      description: '',
      details: {},
      available_today: false,
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      product_images: [],
      categories: { slug: 'desserts' },
      businesses: {
        id: 'b1',
        slug: 'sweet',
        name: 'Sweet',
        locality: 'Bandra West',
        city: 'Mumbai',
        logo_url: null,
        banner_url: null,
        available_today: false,
        delivery_available: false,
        pickup_available: false,
        rating_avg: 0,
        rating_count: 0,
        approved_at: null,
        categories: { slug: 'desserts', name: 'Desserts' },
      },
    });
    expect(detail.distanceM).toBeNull();
    expect(detail.business.distanceM).toBeNull();
  });

  it('sorts images, videos and products by sort_order and filters inactive products', () => {
    const detail = mapBusinessDetail({
      id: 'b1',
      slug: 'sweet',
      name: 'Sweet Crumbs',
      description: 'Cookies',
      address_text: '1 Lane',
      locality: 'Bandra West',
      city: 'Mumbai',
      logo_url: null,
      banner_url: null,
      available_today: true,
      delivery_available: false,
      pickup_available: true,
      rating_avg: 4.5,
      rating_count: 3,
      approved_at: '2026-01-01T00:00:00Z',
      categories: { slug: 'desserts', name: 'Desserts' },
      business_images: [
        { id: 'i2', url: 'https://x/2.webp', sort_order: 2 },
        { id: 'i1', url: 'https://x/1.webp', sort_order: 1 },
      ],
      business_videos: [
        {
          id: 'v2',
          instagram_url: 'https://instagram.com/reel/bbbbb',
          shortcode: 'bbbbb',
          caption: 'B',
          sort_order: 2,
        },
        {
          id: 'v1',
          instagram_url: 'https://instagram.com/reel/aaaaa',
          shortcode: 'aaaaa',
          caption: 'A',
          sort_order: 1,
        },
      ],
      products: [
        {
          id: 'p-inactive',
          name: 'Hidden',
          price_paise: 10000,
          available_today: false,
          is_active: false,
          sort_order: 0,
          created_at: '2026-01-01T00:00:00Z',
          product_images: [],
        },
        {
          id: 'p2',
          name: 'Second',
          price_paise: 20000,
          available_today: false,
          is_active: true,
          sort_order: 2,
          created_at: '2026-01-02T00:00:00Z',
          product_images: [{ id: 'pi2', url: 'https://x/p2.webp', sort_order: 0 }],
        },
        {
          id: 'p1',
          name: 'First',
          price_paise: 10000,
          available_today: true,
          is_active: true,
          sort_order: 1,
          created_at: '2026-01-01T00:00:00Z',
          product_images: [
            { id: 'pi1b', url: 'https://x/p1b.webp', sort_order: 2 },
            { id: 'pi1a', url: 'https://x/p1a.webp', sort_order: 1 },
          ],
        },
      ],
    });

    expect(detail.images.map((i) => i.id)).toEqual(['i1', 'i2']);
    expect(detail.videos.map((v) => v.id)).toEqual(['v1', 'v2']);
    expect(detail.products.map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(detail.products[0].imageUrl).toBe('https://x/p1a.webp');
  });

  it('never includes contact fields in mapped output', () => {
    const detail = mapBusinessDetail({
      id: 'b1',
      slug: 'sweet',
      name: 'Sweet',
      description: '',
      address_text: '',
      locality: 'Bandra West',
      city: 'Mumbai',
      logo_url: null,
      banner_url: null,
      available_today: false,
      delivery_available: false,
      pickup_available: false,
      rating_avg: 0,
      rating_count: 0,
      approved_at: null,
      phone: '9876543210',
      whatsapp: '9876543210',
      categories: { slug: 'desserts', name: 'Desserts' },
      business_images: [],
      business_videos: [],
      products: [],
      business_contacts: { phone: '9876543210', whatsapp: '9876543210' },
    });

    const product = mapProductDetail({
      id: 'p1',
      name: 'Cookies',
      price_paise: 35000,
      description: '',
      details: { weight: '500g' },
      available_today: false,
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      phone: '9876543210',
      product_images: [],
      categories: { slug: 'desserts' },
      businesses: {
        id: 'b1',
        slug: 'sweet',
        name: 'Sweet',
        locality: 'Bandra West',
        city: 'Mumbai',
        logo_url: null,
        banner_url: null,
        available_today: false,
        delivery_available: false,
        pickup_available: false,
        rating_avg: 0,
        rating_count: 0,
        approved_at: null,
        phone: '9876543210',
        whatsapp: '9876543210',
        categories: { slug: 'desserts', name: 'Desserts' },
      },
    });

    const keys = allKeys([detail, product]);
    expect(keys.has('phone')).toBe(false);
    expect(keys.has('whatsapp')).toBe(false);
    expect(keys.has('business_contacts')).toBe(false);
  });
});
