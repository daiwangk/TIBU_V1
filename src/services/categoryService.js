/**
 * categoryService — returns the category taxonomy.
 * Replace with a real API call when the backend is ready.
 * Signatures MUST remain the same.
 */

/** Full category list with URL slug and display metadata. */
const categories = [
  { slug: 'desserts',      label: 'Desserts',      emoji: '🍰' },
  { slug: 'crochet',       label: 'Crochet',        emoji: '🧶' },
  { slug: 'resin',         label: 'Resin Art',      emoji: '🌊' },
  { slug: 'candles',       label: 'Candles',        emoji: '🕯️' },
  { slug: 'embroidery',    label: 'Embroidery',     emoji: '🧵' },
  { slug: 'jewellery',     label: 'Jewellery',      emoji: '💍' },
  { slug: 'women-fashion', label: "Women's Fashion", emoji: '👗' },
  { slug: 'men-fashion',   label: "Men's Fashion",  emoji: '👔' },
  { slug: 'gifts',         label: 'Gifts',          emoji: '🎁' },
  { slug: 'fashion',       label: 'Fashion',        emoji: '✨' },
  { slug: 'handmade',      label: 'Handmade',       emoji: '🤲' },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const NETWORK_DELAY = 150;

export async function listCategories() {
  await delay(NETWORK_DELAY);
  return categories;
}

export async function getCategoryBySlug(slug) {
  await delay(NETWORK_DELAY);
  return categories.find((c) => c.slug === slug) ?? null;
}

