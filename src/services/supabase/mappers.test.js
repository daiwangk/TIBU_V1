import { describe, expect, it } from 'vitest';
import {
  mapBusinessDetail,
  mapBusinessSummary,
  mapCategory,
  mapProductDetail,
  mapProductSummaryFromSearch,
  mapProductSummaryNested,
  mapReview,
  paiseToRupees,
} from './mappers.js';
import { detailsFromDb } from './details.js';

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

  it('maps details jsonb object to [{ label, value }] with humanized labels', () => {
    expect(detailsFromDb({ weight: '500g', serves: '4' })).toEqual([
      { label: 'Weight', value: '500g' },
      { label: 'Serves', value: '4' },
    ]);
  });

  it('humanizes seed keys and drops rows with an empty value', () => {
    expect(detailsFromDb({ shelf_life: '10 days', weight: '' })).toEqual([
      { label: 'Shelf life', value: '10 days' },
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

  describe('Rev2 delivery fields (CONTRACT v1.2)', () => {
    const business = (overrides = {}) => ({
      id: 'b1',
      slug: 'sweet',
      name: 'Sweet',
      locality: 'Bandra West',
      city: 'Mumbai',
      available_today: false,
      delivery_available: true,
      pickup_available: false,
      delivery_time: 'Same day',
      established_year: 2019,
      rating_avg: 0,
      rating_count: 0,
      categories: { slug: 'desserts', name: 'Desserts' },
      ...overrides,
    });

    const product = (overrides = {}, biz = {}) => ({
      id: 'p1',
      name: 'Cookies',
      price_paise: 10000,
      description: '',
      details: [],
      available_today: false,
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      product_images: [],
      categories: { slug: 'desserts' },
      delivery_available: null,
      pickup_available: null,
      delivery_time: null,
      businesses: business(biz),
      ...overrides,
    });

    it('maps businesses.delivery_time and established_year onto BusinessDetail', () => {
      const detail = mapBusinessDetail(business());
      expect(detail.deliveryTime).toBe('Same day');
      expect(detail.establishedYear).toBe(2019);
    });

    it('returns null when the business states neither', () => {
      const detail = mapBusinessDetail(business({ delivery_time: null, established_year: null }));
      expect(detail.deliveryTime).toBeNull();
      expect(detail.establishedYear).toBeNull();
    });

    it('falls back to the business when every product column is NULL', () => {
      const detail = mapProductDetail(product());
      expect(detail.deliveryAvailable).toBe(true);
      expect(detail.pickupAvailable).toBe(false);
      expect(detail.deliveryTime).toBe('Same day');
    });

    it('uses a product override, including false (?? not ||)', () => {
      const detail = mapProductDetail(
        product({ delivery_available: false, pickup_available: true, delivery_time: '2–3 days' }),
      );
      expect(detail.deliveryAvailable).toBe(false);
      expect(detail.pickupAvailable).toBe(true);
      expect(detail.deliveryTime).toBe('2–3 days');
    });

    it('overrides each field independently', () => {
      const detail = mapProductDetail(product({ delivery_available: false }));
      expect(detail.deliveryAvailable).toBe(false);
      expect(detail.pickupAvailable).toBe(false);
      expect(detail.deliveryTime).toBe('Same day');
    });

    it('is null when neither the product nor the business states a delivery time', () => {
      const detail = mapProductDetail(product({}, { delivery_time: null }));
      expect(detail.deliveryTime).toBeNull();
    });
  });

  describe('CONTRACT.md §2–§3 exact shape coverage', () => {
    it('Category matches CONTRACT.md §2', () => {
      const category = mapCategory({
        slug: 'handmade',
        name: 'Handmade',
        parent_slug: null,
        sort_order: 3,
      });
      expect(Object.keys(category).sort()).toEqual([
        'name',
        'parentSlug',
        'slug',
        'sortOrder',
      ]);
    });

    it('BusinessSummary matches CONTRACT.md §3', () => {
      const summary = mapBusinessSummary({
        id: 'b1',
        slug: 'knotty-tales',
        name: 'Knotty Tales',
        category_slug: 'crochet',
        category_name: 'Crochet',
        logo_url: 'https://x/logo.webp',
        banner_url: 'https://x/banner.webp',
        locality: 'Juhu',
        city: 'Mumbai',
        rating_avg: 5,
        rating_count: 1,
        available_today: true,
        delivery_available: true,
        pickup_available: false,
        approved_at: '2026-09-25T00:00:00Z',
        distance_m: 1500,
      });
      expect(Object.keys(summary).sort()).toEqual([
        'approvedAt',
        'availableToday',
        'bannerUrl',
        'categoryName',
        'categorySlug',
        'city',
        'deliveryAvailable',
        'distanceM',
        'id',
        'locality',
        'logoUrl',
        'name',
        'pickupAvailable',
        'rating',
        'reviewCount',
        'slug',
      ]);
    });

    it('ProductSummary matches CONTRACT.md §3 (search RPC & nested)', () => {
      const fromSearch = mapProductSummaryFromSearch({
        id: 'p1',
        name: 'Crochet Teddy Bear',
        price_paise: 85000,
        image_url: 'https://x/teddy.webp',
        available_today: false,
        business_id: 'b1',
        business_slug: 'knotty-tales',
        business_name: 'Knotty Tales',
        business_logo_url: 'https://x/logo.webp',
        locality: 'Juhu',
        rating_avg: 5,
        category_slug: 'crochet',
        created_at: '2026-09-25T00:00:00Z',
        distance_m: 1500,
      });
      const expectedKeys = [
        'availableToday',
        'businessId',
        'businessLogoUrl',
        'businessName',
        'businessRating',
        'businessSlug',
        'categorySlug',
        'createdAt',
        'distanceM',
        'id',
        'imageUrl',
        'locality',
        'name',
        'price',
      ];
      expect(Object.keys(fromSearch).sort()).toEqual(expectedKeys);

      const nested = mapProductSummaryNested(
        {
          id: 'p1',
          name: 'Crochet Teddy Bear',
          price_paise: 85000,
          available_today: false,
          is_active: true,
          created_at: '2026-09-25T00:00:00Z',
          product_images: [{ id: 'pi1', url: 'https://x/teddy.webp', sort_order: 0 }],
          categories: { slug: 'crochet' },
        },
        {
          id: 'b1',
          slug: 'knotty-tales',
          name: 'Knotty Tales',
          logoUrl: 'https://x/logo.webp',
          locality: 'Juhu',
          rating: 5,
          categorySlug: 'crochet',
          distanceM: 1500,
        },
      );
      expect(Object.keys(nested).sort()).toEqual(expectedKeys);
    });

    it('BusinessDetail matches CONTRACT.md §3', () => {
      const detail = mapBusinessDetail({
        id: 'b1',
        slug: 'knotty-tales',
        name: 'Knotty Tales',
        description: 'Handmade crochet',
        address_text: 'Shop 4, Juhu',
        locality: 'Juhu',
        city: 'Mumbai',
        logo_url: 'https://x/logo.webp',
        banner_url: null,
        available_today: true,
        delivery_available: true,
        pickup_available: false,
        delivery_time: '2–3 days',
        established_year: 2021,
        rating_avg: 5,
        rating_count: 1,
        approved_at: '2026-09-25T00:00:00Z',
        distance_m: 1500,
        categories: { slug: 'crochet', name: 'Crochet' },
        business_images: [{ id: 'i1', url: 'https://x/1.webp', sort_order: 0 }],
        business_videos: [],
        products: [],
      });
      expect(Object.keys(detail).sort()).toEqual([
        'addressText',
        'approvedAt',
        'availableToday',
        'bannerUrl',
        'categoryName',
        'categorySlug',
        'city',
        'deliveryAvailable',
        'deliveryTime',
        'description',
        'distanceM',
        'establishedYear',
        'id',
        'images',
        'locality',
        'logoUrl',
        'name',
        'pickupAvailable',
        'products',
        'rating',
        'reviewCount',
        'slug',
        'videos',
      ]);
    });

    it('ProductDetail matches CONTRACT.md §3', () => {
      const detail = mapProductDetail({
        id: 'p1',
        name: 'Crochet Teddy Bear',
        price_paise: 85000,
        description: 'Cute handcrafted bear',
        details: [{ label: 'Material', value: 'Cotton' }],
        available_today: false,
        is_active: true,
        created_at: '2026-09-25T00:00:00Z',
        delivery_available: null,
        pickup_available: null,
        delivery_time: null,
        distance_m: 1500,
        product_images: [{ id: 'pi1', url: 'https://x/teddy.webp', sort_order: 0 }],
        categories: { slug: 'crochet' },
        businesses: {
          id: 'b1',
          slug: 'knotty-tales',
          name: 'Knotty Tales',
          description: 'Handmade crochet',
          address_text: 'Shop 4, Juhu',
          locality: 'Juhu',
          city: 'Mumbai',
          logo_url: 'https://x/logo.webp',
          banner_url: null,
          available_today: true,
          delivery_available: true,
          pickup_available: false,
          delivery_time: '2–3 days',
          established_year: 2021,
          rating_avg: 5,
          rating_count: 1,
          approved_at: '2026-09-25T00:00:00Z',
          categories: { slug: 'crochet', name: 'Crochet' },
        },
      });
      expect(Object.keys(detail).sort()).toEqual([
        'availableToday',
        'business',
        'businessId',
        'businessLogoUrl',
        'businessName',
        'businessRating',
        'businessSlug',
        'categorySlug',
        'createdAt',
        'deliveryAvailable',
        'deliveryTime',
        'description',
        'details',
        'distanceM',
        'id',
        'imageUrl',
        'images',
        'locality',
        'name',
        'pickupAvailable',
        'price',
      ]);
    });

    it('Review matches CONTRACT.md §3', () => {
      const review = mapReview(
        {
          id: 'r1',
          business_id: 'b1',
          user_id: 'u1',
          reviewer_name: 'Priya',
          rating: 5,
          body: 'Loved the quality!',
          created_at: '2026-10-01T00:00:00Z',
          updated_at: '2026-10-01T00:00:00Z',
        },
        'u1',
      );
      expect(Object.keys(review).sort()).toEqual([
        'body',
        'businessId',
        'createdAt',
        'id',
        'isMine',
        'rating',
        'reviewerName',
        'updatedAt',
      ]);
      expect(review.isMine).toBe(true);
    });
  });
});
