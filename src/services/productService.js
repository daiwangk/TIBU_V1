import { normalizedProducts } from './mock/normalize';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const NETWORK_DELAY = 150;

/**
 * List products with optional filters.
 * @param {Object} filters
 * @param {string} [filters.category] - Category slug
 * @param {string} [filters.businessId] - Filter by specific business
 * @param {boolean} [filters.availableToday] - Filter by availability
 * @param {string} [filters.q] - Search query
 * @param {string} [filters.sort] - 'newest', 'price-asc', 'price-desc'
 */
export async function listProducts(filters = {}) {
  await delay(NETWORK_DELAY);
  let result = normalizedProducts;

  if (filters.category && filters.category !== 'all') {
    let normCat = filters.category.toLowerCase();
    if (normCat === 'womenfashion') normCat = 'women-fashion';
    if (normCat === 'menfashion') normCat = 'men-fashion';
    result = result.filter(p => p.category === normCat || p.category.replace('-', '') === normCat.replace('-', ''));
  }

  if (filters.businessId) {
    result = result.filter(p => p.businessId === filters.businessId);
  }

  if (filters.availableToday) {
    result = result.filter(p => p.availableToday);
  }

  if (filters.q) {
    const query = filters.q.toLowerCase().trim();
    result = result.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
  }

  if (filters.sort) {
    if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (filters.sort === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return result;
}

/**
 * Get product by ID.
 */
export async function getProductById(id) {
  await delay(NETWORK_DELAY);
  return normalizedProducts.find((p) => p.id === id) ?? null;
}

/**
 * Get newest products.
 */
export async function getNewestProducts() {
  return listProducts({ sort: 'newest' }).then(res => res.slice(0, 10));
}

