import { useQuery } from '@tanstack/react-query';
import { getProductById } from '../services/index.js';
import { qk } from './keys.js';

/**
 * Fetch a single product's detail by ID.
 *
 * @param {string|undefined} id
 * @param {{ lat: number, lng: number }|null} [near]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useProduct(id, near = null, options = {}) {
  return useQuery({
    queryKey: qk.product(id, near),
    queryFn: () => getProductById(id, { near }),
    enabled: Boolean(id),
    ...options,
  });
}
