import { describe, expect, it } from 'vitest';
import { MOCK_USER_LOCATION } from '../../utils/distance.js';
import { normalizedBusinesses, normalizedProducts } from './normalize.js';
import { businesses, products } from './fixtures.js';
import * as mock from './index.js';

const HANDMADE = new Set(['crochet', 'embroidery', 'resin-art', 'candles']);

function assertNoPhoneKeys(obj, path = '') {
  if (obj == null || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    expect(k, path).not.toMatch(/phone|whatsapp/i);
    if (v && typeof v === 'object') assertNoPhoneKeys(v, `${path}.${k}`);
  }
}

describe('mock adapter', () => {
  it('(a) category handmade returns only crochet/embroidery/resin-art/candles products', async () => {
    const rows = await mock.searchProducts({ category: 'handmade', limit: 50 });
    expect(rows.length).toBeGreaterThan(0);
    for (const p of rows) {
      expect(HANDMADE.has(p.categorySlug)).toBe(true);
    }
  });

  it('(b) two calls return the same order and distances', async () => {
    const near = MOCK_USER_LOCATION;
    const a = await mock.searchProducts({ near, limit: 20 });
    const b = await mock.searchProducts({ near, limit: 20 });
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
    expect(a.map((p) => p.distanceM)).toEqual(b.map((p) => p.distanceM));
  });

  it('(c) price_asc is ascending and does not mutate a later unsorted call', async () => {
    const baseline = await mock.searchProducts({ limit: 50 });
    const sorted = await mock.searchProducts({ sort: 'price_asc', limit: 50 });
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i - 1].price);
    }
    const later = await mock.searchProducts({ limit: 50 });
    expect(later.map((p) => p.id)).toEqual(baseline.map((p) => p.id));
  });

  it('(c2) limit: 100 returns at most 50', async () => {
    const rows = await mock.searchProducts({ limit: 100 });
    expect(rows.length).toBeLessThanOrEqual(50);
  });

  it('(c3) near with default radius excludes far origin; radiusKm null includes', async () => {
    const pune = { lat: 18.5204, lng: 73.8567 };
    const empty = await mock.searchProducts({ near: pune, limit: 50 });
    expect(empty).toEqual([]);
    const open = await mock.searchProducts({ near: pune, radiusKm: null, limit: 50 });
    expect(open.length).toBeGreaterThan(0);
  });

  it('(d) no returned object has phone/whatsapp keys', async () => {
    const biz = await mock.searchBusinesses({ limit: 5 });
    const prod = await mock.searchProducts({ limit: 5 });
    const detail = await mock.getBusinessBySlug(biz[0].slug);
    const product = await mock.getProductById(prod[0].id);
    const revs = await mock.listReviews(biz[0].id);
    for (const row of [...biz, ...prod, detail, product, ...revs]) {
      assertNoPhoneKeys(row);
    }
  });

  it("(e) getProductById('does-not-exist') → null", async () => {
    expect(await mock.getProductById('does-not-exist')).toBeNull();
  });

  it('availableToday: false matches omit; true is a strict subset', async () => {
    const omit = await mock.searchProducts({ limit: 50 });
    const falsy = await mock.searchProducts({ availableToday: false, limit: 50 });
    const only = await mock.searchProducts({ availableToday: true, limit: 50 });
    expect(falsy.length).toBe(omit.length);
    expect(only.length).toBeLessThan(omit.length);
    expect(only.every((p) => p.availableToday)).toBe(true);
  });

  // Deleted with normalize.js in B2.4 — keeps legacy card links stable until then.
  it('fixture business slugs and product ids match normalized ids', () => {
    const fixtureBiz = new Set(businesses.map((b) => b.slug));
    const fixtureProd = new Set(products.map((p) => p.id));
    const normBiz = new Set(normalizedBusinesses.map((b) => b.id));
    const normProd = new Set(normalizedProducts.map((p) => p.id));
    expect(fixtureBiz).toEqual(normBiz);
    expect(fixtureProd).toEqual(normProd);
  });
});
