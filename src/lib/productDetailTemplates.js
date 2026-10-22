/**
 * Suggested "details" rows for a new product, by category (DECISIONS D36). They prefill empty label
 * rows; the seller can rename, delete and add rows. No per-category database schema.
 */

const FOOD = ['Weight / Quantity', 'Serves', 'Shelf life', 'Veg / Eggless'];
const FASHION = ['Sizes available', 'Size chart', 'Fabric', 'Fit'];
const HANDMADE = ['Dimensions', 'Material', 'Made to order'];

/** @type {Record<string, string[]>} */
const TEMPLATES = {
  desserts: FOOD,
  food: FOOD,
  fashion: FASHION,
  jewellery: ['Material', 'Size'],
  handmade: HANDMADE,
  candles: ['Burn time', 'Wax', 'Fragrance'],
  gifts: ["What's included", 'Personalisation'],
};

/** Child categories without a list of their own use their parent's. */
const PARENT_OF = {
  'womens-fashion': 'fashion',
  'mens-fashion': 'fashion',
  crochet: 'handmade',
  embroidery: 'handmade',
  'resin-art': 'handmade',
};

/**
 * Labels to prefill for a category slug: its own list, else its parent's, else none.
 *
 * @param {string|null|undefined} categorySlug
 * @returns {string[]}
 */
export function templateFor(categorySlug) {
  if (!categorySlug) return [];
  const own = Object.hasOwn(TEMPLATES, categorySlug) ? TEMPLATES[categorySlug] : null;
  const parent = Object.hasOwn(PARENT_OF, categorySlug) ? TEMPLATES[PARENT_OF[categorySlug]] : null;
  const labels = own ?? parent;
  return labels ? [...labels] : [];
}

/**
 * Whether the size-chart hint applies (fashion and its children).
 *
 * @param {string|null|undefined} categorySlug
 * @returns {boolean}
 */
export function isFashionCategory(categorySlug) {
  return categorySlug === 'fashion' || (Object.hasOwn(PARENT_OF, categorySlug) && PARENT_OF[categorySlug] === 'fashion');
}
