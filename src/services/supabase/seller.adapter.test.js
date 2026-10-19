import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSession = vi.fn();
const getMe = vi.fn();
const from = vi.fn();
const rpc = vi.fn();

vi.mock('./auth.js', () => ({ getSession: (...a) => getSession(...a) }));
vi.mock('./me.js', () => ({ getMe: (...a) => getMe(...a) }));
vi.mock('./client.js', () => ({ getSupabase: () => ({ from, rpc }) }));

const {
  saveMyBusiness,
  saveProduct,
  setAvailableToday,
} = await import('./seller.js');

const SESSION = { userId: 'user-1', email: 'a@b.co' };

const BUSINESS_ROW = {
  id: 'biz-1',
  owner_id: 'user-1',
  slug: 'sweet-crumbs-7k2p',
  name: 'Sweet Crumbs',
  status: 'draft',
  category_id: 3,
  description: 'Home bakery',
  logo_url: null,
  banner_url: null,
  instagram_handle: null,
  address_text: null,
  locality: 'Bandra West',
  city: 'Mumbai',
  lat: 19.06,
  lng: 72.83,
  location: { type: 'Point' },
  delivery_available: true,
  pickup_available: true,
  delivery_time: 'Same day',
  established_year: 2019,
  available_today: false,
  rating_avg: 0,
  rating_count: 0,
  rejection_reason: null,
  submitted_at: null,
  approved_at: null,
  categories: { slug: 'desserts', name: 'Desserts' },
  business_contacts: null,
  business_images: [],
  business_videos: [],
  products: [],
};

function chain(result = { data: null, error: null }) {
  const q = {};
  const self = () => q;
  q.select = vi.fn(self);
  q.insert = vi.fn(self);
  q.update = vi.fn(self);
  q.upsert = vi.fn(self);
  q.delete = vi.fn(self);
  q.eq = vi.fn(self);
  q.maybeSingle = vi.fn(async () => result);
  q.single = vi.fn(async () => result);
  q.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return q;
}

beforeEach(() => {
  vi.clearAllMocks();
  getSession.mockResolvedValue(SESSION);
});

describe('saveMyBusiness', () => {
  it('writes a column whitelist (never status/owner_id/rating) and retries once on slug 23505', async () => {
    const categories = chain({ data: { id: 3 }, error: null });
    const businesses = chain();
    businesses.maybeSingle
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: BUSINESS_ROW, error: null });
    businesses.insert
      .mockImplementationOnce(() => chain({
        data: null,
        error: { code: '23505' },
      }))
      .mockImplementationOnce(() => chain({ data: null, error: null }));

    from.mockImplementation((table) => {
      if (table === 'categories') return categories;
      if (table === 'businesses') return businesses;
      throw new Error(`unexpected table ${table}`);
    });

    const saved = await saveMyBusiness({
      name: 'Sweet Crumbs',
      description: 'Home bakery',
      categorySlug: 'desserts',
      addressText: '',
      locality: 'Bandra West',
      city: 'Mumbai',
      lat: 19.123456,
      lng: 72.8299,
      instagramHandle: '',
      deliveryAvailable: true,
      pickupAvailable: false,
      deliveryTime: ' Same day ',
      establishedYear: 2019,
      status: 'approved',
      owner_id: 'attacker',
    });

    expect(saved.slug).toBe('sweet-crumbs-7k2p');
    expect(businesses.insert).toHaveBeenCalledTimes(2);
    const first = businesses.insert.mock.calls[0][0];
    const second = businesses.insert.mock.calls[1][0];
    expect(first.slug).toMatch(/^sweet-crumbs-[a-z0-9]{4}$/);
    expect(second.slug).toMatch(/^sweet-crumbs-[a-z0-9]{4}$/);
    expect(second.slug).not.toBe(first.slug);
    for (const payload of [first, second]) {
      expect(payload).toMatchObject({
        name: 'Sweet Crumbs',
        owner_id: 'user-1',
        lat: 19.123,
        lng: 72.83,
        delivery_time: 'Same day',
        established_year: 2019,
      });
      expect(payload).not.toHaveProperty('status');
      expect(payload).not.toHaveProperty('rating_avg');
      expect(Object.keys(payload).sort()).toEqual([
        'address_text',
        'category_id',
        'city',
        'delivery_available',
        'delivery_time',
        'description',
        'established_year',
        'instagram_handle',
        'lat',
        'lng',
        'locality',
        'name',
        'owner_id',
        'pickup_available',
        'slug',
      ].sort());
    }
  });

  it('uses the same whitelist on update and never sends protected columns', async () => {
    const categories = chain({ data: { id: 3 }, error: null });
    const businesses = chain();
    businesses.maybeSingle
      .mockResolvedValueOnce({ data: BUSINESS_ROW, error: null })
      .mockResolvedValueOnce({ data: BUSINESS_ROW, error: null });

    from.mockImplementation((table) => {
      if (table === 'categories') return categories;
      if (table === 'businesses') return businesses;
      throw new Error(`unexpected table ${table}`);
    });

    await saveMyBusiness({
      name: 'Sweet Crumbs',
      description: 'Home bakery',
      categorySlug: 'desserts',
      addressText: '',
      locality: 'Bandra West',
      city: 'Mumbai',
      lat: 19.123456,
      lng: 72.8299,
      instagramHandle: '',
      deliveryAvailable: true,
      pickupAvailable: false,
      deliveryTime: ' Same day ',
      establishedYear: 2019,
      status: 'approved',
      owner_id: 'attacker',
      rating_avg: 5,
      rating_count: 12,
      approved_at: '2026-01-01T00:00:00Z',
      slug: 'attacker-slug',
    });

    const payload = businesses.update.mock.calls[0][0];
    expect(payload).toMatchObject({
      name: 'Sweet Crumbs',
      lat: 19.123,
      lng: 72.83,
      delivery_time: 'Same day',
      established_year: 2019,
    });
    for (const column of ['status', 'owner_id', 'rating_avg', 'rating_count', 'approved_at', 'slug']) {
      expect(payload).not.toHaveProperty(column);
    }
    expect(businesses.eq).toHaveBeenCalledWith('id', BUSINESS_ROW.id);
  });
});

describe('saveProduct', () => {
  it('always sends explicit null override columns on update, including when deliveryOverride is null', async () => {
    const productRow = {
      id: 'prod-1',
      name: 'Cookies',
      price_paise: 35000,
      description: 'Batch',
      details: [],
      available_today: false,
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      sort_order: 0,
      product_images: [],
      categories: { slug: 'desserts' },
      delivery_available: null,
      pickup_available: null,
      delivery_time: null,
      businesses: BUSINESS_ROW,
    };
    const businesses = chain({ data: BUSINESS_ROW, error: null });
    const products = chain();
    products.eq = vi.fn(() => products);
    products.update = vi.fn(() => products);
    products.then = (resolve, reject) => Promise.resolve({ data: null, error: null }).then(resolve, reject);
    products.maybeSingle.mockResolvedValue({ data: productRow, error: null });

    from.mockImplementation((table) => {
      if (table === 'businesses') return businesses;
      if (table === 'products') return products;
      throw new Error(`unexpected table ${table}`);
    });

    await saveProduct({
      id: 'prod-1',
      name: 'Cookies',
      price: 350,
      description: 'Batch',
      categorySlug: null,
      details: [],
      availableToday: false,
      isActive: true,
      deliveryOverride: null,
    });

    expect(products.update).toHaveBeenCalledWith(expect.objectContaining({
      price_paise: 35000,
      delivery_available: null,
      pickup_available: null,
      delivery_time: null,
    }));
    expect(products.eq).toHaveBeenCalledWith('id', 'prod-1');
  });

  it('writes an object delivery override, preserving false and clearing empty delivery time', async () => {
    const productRow = {
      id: 'prod-1',
      name: 'Cookies',
      price_paise: 35000,
      description: 'Batch',
      details: [],
      available_today: false,
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      sort_order: 0,
      product_images: [],
      categories: { slug: 'desserts' },
      delivery_available: false,
      pickup_available: true,
      delivery_time: null,
      businesses: BUSINESS_ROW,
    };
    const businesses = chain({ data: BUSINESS_ROW, error: null });
    const products = chain();
    products.eq = vi.fn(() => products);
    products.update = vi.fn(() => products);
    products.then = (resolve, reject) => Promise.resolve({ data: null, error: null }).then(resolve, reject);
    products.maybeSingle.mockResolvedValue({ data: productRow, error: null });

    from.mockImplementation((table) => {
      if (table === 'businesses') return businesses;
      if (table === 'products') return products;
      throw new Error(`unexpected table ${table}`);
    });

    await saveProduct({
      id: 'prod-1',
      name: 'Cookies',
      price: 350,
      description: 'Batch',
      categorySlug: null,
      details: [],
      availableToday: false,
      isActive: true,
      deliveryOverride: {
        deliveryAvailable: false,
        pickupAvailable: true,
        deliveryTime: '',
      },
    });

    expect(products.update).toHaveBeenCalledWith(expect.objectContaining({
      delivery_available: false,
      pickup_available: true,
      delivery_time: null,
    }));
  });
});

describe('setAvailableToday', () => {
  it('updates available_today scoped only by id', async () => {
    const products = chain({ data: null, error: null });
    from.mockImplementation((table) => {
      if (table === 'products') return products;
      throw new Error(`unexpected table ${table}`);
    });

    await setAvailableToday({ kind: 'product', id: 'prod-1', value: true });

    expect(from).toHaveBeenCalledWith('products');
    expect(products.update).toHaveBeenCalledWith({ available_today: true });
    expect(products.eq).toHaveBeenCalledWith('id', 'prod-1');
    expect(products.eq).not.toHaveBeenCalledWith('owner_id', SESSION.userId);
    expect(products.eq).not.toHaveBeenCalledWith('business_id', expect.anything());
  });
});
