/** @typedef {import('../contract.js').Category} Category */

/** Contract §2 / seed_categories — sortOrder matches the SQL seed. */
export const CATEGORIES = /** @type {Category[]} */ ([
  { slug: 'desserts', name: 'Desserts', parentSlug: null, sortOrder: 10 },
  { slug: 'food', name: 'Home Food', parentSlug: null, sortOrder: 20 },
  { slug: 'handmade', name: 'Handmade', parentSlug: null, sortOrder: 30 },
  { slug: 'crochet', name: 'Crochet', parentSlug: 'handmade', sortOrder: 31 },
  { slug: 'embroidery', name: 'Embroidery', parentSlug: 'handmade', sortOrder: 32 },
  { slug: 'resin-art', name: 'Resin Art', parentSlug: 'handmade', sortOrder: 33 },
  { slug: 'candles', name: 'Candles', parentSlug: 'handmade', sortOrder: 34 },
  { slug: 'fashion', name: 'Fashion', parentSlug: null, sortOrder: 40 },
  { slug: 'womens-fashion', name: "Women's Fashion", parentSlug: 'fashion', sortOrder: 41 },
  { slug: 'mens-fashion', name: "Men's Fashion", parentSlug: 'fashion', sortOrder: 42 },
  { slug: 'jewellery', name: 'Jewellery', parentSlug: null, sortOrder: 50 },
  { slug: 'gifts', name: 'Gifts', parentSlug: null, sortOrder: 60 },
]);

const bySlug = new Map(CATEGORIES.map((c) => [c.slug, c]));

/** Raw product `page` → contract category slug. */
const PRODUCT_PAGE_TO_SLUG = {
  desserts: 'desserts',
  crochet: 'crochet',
  candles: 'candles',
  embroidery: 'embroidery',
  jewellery: 'jewellery',
  gifts: 'gifts',
  resin: 'resin-art',
  womenfashion: 'womens-fashion',
  menfashion: 'mens-fashion',
};

/** Raw business `category` display name → contract category slug. */
const BUSINESS_CATEGORY_TO_SLUG = {
  Desserts: 'desserts',
  Crochet: 'crochet',
  Candles: 'candles',
  Embroidery: 'embroidery',
  Jewellery: 'jewellery',
  Gifts: 'gifts',
  'Resin Art': 'resin-art',
  "Women's Fashion": 'womens-fashion',
  "Men's Fashion": 'mens-fashion',
};

/**
 * @param {string} page
 * @returns {string}
 */
export function mapProductPage(page) {
  if (!Object.hasOwn(PRODUCT_PAGE_TO_SLUG, page)) {
    throw new Error(`Unknown product page value: ${JSON.stringify(page)}`);
  }
  return PRODUCT_PAGE_TO_SLUG[page];
}

/**
 * @param {string} category
 * @returns {string}
 */
export function mapBusinessCategory(category) {
  if (!Object.hasOwn(BUSINESS_CATEGORY_TO_SLUG, category)) {
    throw new Error(`Unknown business category value: ${JSON.stringify(category)}`);
  }
  return BUSINESS_CATEGORY_TO_SLUG[category];
}

/**
 * The slug plus all of its children (parent includes descendants in search).
 * @param {string} slug
 * @returns {string[]}
 */
export function descendantSlugs(slug) {
  const out = [slug];
  for (const c of CATEGORIES) {
    if (c.parentSlug === slug) out.push(c.slug);
  }
  return out;
}

/**
 * @param {string} slug
 * @returns {Category|undefined}
 */
export function getCategoryRecord(slug) {
  return bySlug.get(slug);
}

// Fail loudly at import if any map value is not a known category slug.
for (const [raw, slug] of Object.entries(PRODUCT_PAGE_TO_SLUG)) {
  if (!bySlug.has(slug)) {
    throw new Error(`Product page map "${raw}" → unknown slug "${slug}"`);
  }
}
for (const [raw, slug] of Object.entries(BUSINESS_CATEGORY_TO_SLUG)) {
  if (!bySlug.has(slug)) {
    throw new Error(`Business category map "${raw}" → unknown slug "${slug}"`);
  }
}
