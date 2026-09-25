import { normalizedBusinesses } from './mock/normalize';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const NETWORK_DELAY = 150;

/**
 * Returns all businesses, optionally filtered by category.
 */
export async function listBusinesses(categoryKey) {
  await delay(NETWORK_DELAY);
  let result = normalizedBusinesses;
  
  if (categoryKey && categoryKey !== 'all') {
    // "womenfashion" or "women-fashion" -> "women-fashion"
    let normCat = categoryKey.toLowerCase();
    if (normCat === 'womenfashion') normCat = 'women-fashion';
    if (normCat === 'menfashion') normCat = 'men-fashion';
    
    result = result.filter(b => b.category === normCat || b.category.replace('-', '') === normCat.replace('-', ''));
  }
  return result;
}

/**
 * Returns a specific business by ID.
 */
export async function getBusinessById(id) {
  await delay(NETWORK_DELAY);
  return normalizedBusinesses.find((b) => b.id === id) ?? null;
}

/**
 * Returns the newest businesses (mock logic: top 10).
 */
export async function getNewestBusinesses() {
  await delay(NETWORK_DELAY);
  return [...normalizedBusinesses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
}

