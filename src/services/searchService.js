import { normalizedProducts, normalizedBusinesses } from './mock/normalize';
import { calculateDistance, MOCK_USER_LOCATION } from '../utils/distance';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const NETWORK_DELAY = 150;

/**
 * Global search across products and businesses.
 * @param {string} q - Search query
 * @param {Object} filters
 * @param {string} [filters.category] - 'All' or specific category
 * @param {number} [filters.distanceMax] - max distance in meters
 * @param {number} [filters.priceMax] - max price
 * @returns {Promise<{ products: Array, businesses: Array }>}
 */
export async function search(q, filters = {}) {
  await delay(NETWORK_DELAY);
  
  const query = (q || '').toLowerCase().trim();
  
  let products = normalizedProducts;
  let businesses = normalizedBusinesses;

  // Filter by category
  if (filters.category && filters.category !== 'All') {
    let normCat = filters.category.toLowerCase();
    if (normCat === 'womenfashion') normCat = 'women-fashion';
    if (normCat === 'menfashion') normCat = 'men-fashion';
    
    products = products.filter(p => p.category === normCat || p.category.replace('-', '') === normCat.replace('-', ''));
    businesses = businesses.filter(b => b.category === normCat || b.category.replace('-', '') === normCat.replace('-', ''));
  }

  // Filter by text query
  if (query) {
    products = products.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    businesses = businesses.filter(b => b.name.toLowerCase().includes(query) || b.description.toLowerCase().includes(query));
  }

  // Filter by price
  if (filters.priceMax && filters.priceMax > 0) {
    products = products.filter(p => p.price <= filters.priceMax);
    // Hide businesses if searching by price, or maybe only show businesses that have products under the price?
    // Let's filter businesses to those that have matching products
    const validBids = new Set(products.map(p => p.businessId));
    businesses = businesses.filter(b => validBids.has(b.id));
  }

  // Filter by distance
  if (filters.distanceMax && filters.distanceMax > 0) {
    businesses = businesses.filter(b => {
      const dist = calculateDistance(MOCK_USER_LOCATION.lat, MOCK_USER_LOCATION.lng, b.lat, b.lng);
      return dist <= filters.distanceMax;
    });
    // Filter products to only those whose businesses are within distance
    const validBids = new Set(businesses.map(b => b.id));
    products = products.filter(p => validBids.has(p.businessId));
  }

  return { products, businesses };
}
