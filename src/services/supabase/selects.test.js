import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSupabaseMock } = vi.hoisted(() => ({ getSupabaseMock: vi.fn() }));

vi.mock('./client.js', () => ({ getSupabase: getSupabaseMock }));

import { getBusinessBySlug } from './catalog.js';
import { listSavedBusinesses, listSavedProducts } from './saved.js';
import { BIZ_SUMMARY_COLS, PRODUCT_SUMMARY_COLS } from './selects.js';

// ---------------------------------------------------------------------------
// Real columns, parsed from supabase/migrations (the source of truth)
// ---------------------------------------------------------------------------

const NON_COLUMN = /^(primary|unique|check|constraint|foreign)\b/i;

function parseSchema() {
  const dir = fileURLToPath(new URL('../../../supabase/migrations/', import.meta.url));
  const sql = readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => readFileSync(join(dir, f), 'utf8'))
    .join('\n');

  /** @type {Record<string, Set<string>>} */
  const tables = {};

  for (const m of sql.matchAll(/create table (?:if not exists )?public\.(\w+)\s*\(([\s\S]*?)\n\);/gi)) {
    const cols = (tables[m[1]] ??= new Set());
    for (const line of m[2].split('\n')) {
      const first = line.trim().replace(/--.*$/, '').match(/^(\w+)\s+\S/);
      if (first && !NON_COLUMN.test(first[1])) cols.add(first[1]);
    }
  }
  for (const m of sql.matchAll(/alter table public\.(\w+)([\s\S]*?);/gi)) {
    for (const c of m[2].matchAll(/add column (?:if not exists )?(\w+)/gi)) {
      (tables[m[1]] ??= new Set()).add(c[1]);
    }
  }
  return tables;
}

const SCHEMA = parseSchema();

// Embed name in a select string → table it reads.
const EMBED_TABLE = {
  products: 'products',
  businesses: 'businesses',
  categories: 'categories',
  product_images: 'product_images',
};

/** Split on commas that are not inside parentheses. */
function splitTop(str) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of str) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * Walk a PostgREST select string; return a list of "table.column" that do not exist.
 * @param {string} select
 * @param {string} table
 */
function unknownColumns(select, table) {
  const bad = [];
  for (const item of splitTop(select)) {
    const embed = item.match(/^(?:\w+:)?(\w+)(?:![\w.]+)?\s*\(([\s\S]*)\)$/);
    if (embed) {
      const child = EMBED_TABLE[embed[1]];
      if (!child) bad.push(`${table}.<unknown embed ${embed[1]}>`);
      else bad.push(...unknownColumns(embed[2], child));
    } else {
      const col = item.replace(/^\w+:/, '');
      if (!SCHEMA[table]?.has(col)) bad.push(`${table}.${col}`);
    }
  }
  return bad;
}

// ---------------------------------------------------------------------------
// Fake client: records the select string, resolves canned rows
// ---------------------------------------------------------------------------

function fakeClient(rows) {
  const selects = [];
  const query = {
    select: vi.fn((s) => {
      selects.push(s);
      return query;
    }),
    order: vi.fn(async () => ({ data: rows, error: null })),
    eq: vi.fn(() => query),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
  };
  return { client: { from: vi.fn(() => query) }, selects };
}

const BIZ = {
  id: 'b1',
  slug: 'knotty-tales',
  name: 'Knotty Tales',
  status: 'approved',
  logo_url: 'https://x/logo.webp',
  locality: 'Juhu',
  rating_avg: 4.5,
  rating_count: 3,
  available_today: true,
  categories: { slug: 'crochet', name: 'Crochet' },
};

function savedRow(productOverrides = {}) {
  return {
    created_at: '2026-10-15T10:00:00Z',
    products: {
      id: 'p1',
      name: 'Teddy',
      price_paise: 125000,
      available_today: false,
      is_active: true,
      created_at: '2026-10-01T00:00:00Z',
      categories: { slug: 'soft-toys', name: 'Soft toys' },
      product_images: [
        { id: 'i2', url: 'https://x/2.webp', sort_order: 2 },
        { id: 'i1', url: 'https://x/1.webp', sort_order: 1 },
      ],
      businesses: BIZ,
      ...productOverrides,
    },
  };
}

const flat = (s) => s.replace(/\s+/g, ' ');

describe('schema parser (guards the guard)', () => {
  it('reads real columns from the migrations', () => {
    expect(SCHEMA.products.has('category_id')).toBe(true);
    expect(SCHEMA.products.has('delivery_time')).toBe(true); // added by an alter table
    expect(SCHEMA.products.has('category_slug')).toBe(false);
    expect(SCHEMA.categories.has('slug')).toBe(true);
    expect(SCHEMA.product_images.has('sort_order')).toBe(true);
    expect(SCHEMA.businesses.has('established_year')).toBe(true);
  });

  it('flags a column that does not exist, at any depth', () => {
    expect(unknownColumns('id, category_slug', 'products')).toEqual(['products.category_slug']);
    expect(unknownColumns('id, businesses!inner ( id, nope )', 'products')).toEqual(['businesses.nope']);
  });
});

describe('shared select fragments', () => {
  it('only reference columns that exist in the migrations', () => {
    expect(unknownColumns(PRODUCT_SUMMARY_COLS, 'products')).toEqual([]);
    expect(unknownColumns(BIZ_SUMMARY_COLS, 'businesses')).toEqual([]);
  });

  it('never mention category_slug', () => {
    expect(PRODUCT_SUMMARY_COLS).not.toContain('category_slug');
    expect(BIZ_SUMMARY_COLS).not.toContain('category_slug');
  });
});

describe('select strings sent by the adapters', () => {
  beforeEach(() => getSupabaseMock.mockReset());

  it('listSavedProducts', async () => {
    const { client, selects } = fakeClient([]);
    getSupabaseMock.mockReturnValue(client);
    await listSavedProducts();

    expect(client.from).toHaveBeenCalledWith('saved_products');
    const sel = selects[0];
    expect(sel).not.toContain('category_slug');
    // root is saved_products; products!inner is its embed
    expect(unknownColumns(sel.replace('created_at,', 'created_at, '), 'saved_products')).toEqual([]);
  });

  it('listSavedBusinesses', async () => {
    const { client, selects } = fakeClient([]);
    getSupabaseMock.mockReturnValue(client);
    await listSavedBusinesses();

    expect(selects[0]).not.toContain('category_slug');
    expect(unknownColumns(selects[0], 'saved_businesses')).toEqual([]);
  });

  it('getBusinessBySlug (nested products)', async () => {
    const { client, selects } = fakeClient([]);
    getSupabaseMock.mockReturnValue(client);
    await getBusinessBySlug('knotty-tales');

    expect(selects[0]).not.toContain('category_slug');
    const nested = flat(selects[0]).match(/products \(([\s\S]*)\)\s*$/)?.[1] ?? '';
    expect(nested).toContain(PRODUCT_SUMMARY_COLS);
    expect(unknownColumns(nested, 'products')).toEqual([]);
  });
});

describe('listSavedProducts mapping', () => {
  beforeEach(() => getSupabaseMock.mockReset());

  async function run(rows) {
    getSupabaseMock.mockReturnValue(fakeClient(rows).client);
    return listSavedProducts();
  }

  it('returns a valid ProductSummary: rupees, cover image, product category override', async () => {
    const [p] = await run([savedRow()]);
    expect(p).toEqual({
      id: 'p1',
      name: 'Teddy',
      price: 1250,
      imageUrl: 'https://x/1.webp',
      categorySlug: 'soft-toys',
      availableToday: false,
      businessId: 'b1',
      businessSlug: 'knotty-tales',
      businessName: 'Knotty Tales',
      businessLogoUrl: 'https://x/logo.webp',
      businessRating: 4.5,
      locality: 'Juhu',
      distanceM: null,
      createdAt: '2026-10-01T00:00:00Z',
    });
    expect(Number.isInteger(p.price)).toBe(true);
  });

  it.each([null, undefined])(
    'falls back to the business category when the product category embed is %s',
    async (embed) => {
      const [p] = await run([savedRow({ categories: embed })]);
      expect(p.categorySlug).toBe('crochet');
    },
  );

  it('skips inactive products and non-approved businesses', async () => {
    const out = await run([
      savedRow({ is_active: false }),
      savedRow({ businesses: { ...BIZ, status: 'suspended' } }),
    ]);
    expect(out).toEqual([]);
  });
});
