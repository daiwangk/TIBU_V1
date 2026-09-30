import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getBusinessBySlug,
  getCategory,
  getProductById,
  listCategories,
  listReviews,
  searchBusinesses,
  searchProducts,
} from '../services/index.js';
import { qk } from './keys.js';

const PAGE_SIZE = 20;

/**
 * @param {Record<string, unknown>} [params]
 * @returns {Record<string, unknown>}
 */
function withoutOffset(params = {}) {
  const { offset: _offset, ...rest } = params;
  return rest;
}

/** All active categories. */
export function useCategories() {
  return useQuery({
    queryKey: qk.categories,
    queryFn: () => listCategories(),
  });
}

/**
 * Single category by slug.
 * @param {string|undefined} slug
 */
export function useCategory(slug) {
  return useQuery({
    queryKey: [...qk.categories, slug],
    queryFn: () => getCategory(slug),
    enabled: !!slug,
  });
}

/**
 * One-shot business search.
 * @param {import('../services/contract.js').SearchParams} [params]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useBusinessSearch(params = {}, options = {}) {
  return useQuery({
    queryKey: qk.businesses(params),
    queryFn: () => searchBusinesses(params),
    ...options,
  });
}

/**
 * One-shot product search.
 * @param {import('../services/contract.js').SearchParams} [params]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useProductSearch(params = {}, options = {}) {
  return useQuery({
    queryKey: qk.products(params),
    queryFn: () => searchProducts(params),
    ...options,
  });
}

/**
 * Infinite business search — pages of 20 via offset; limit never grows.
 * @param {import('../services/contract.js').SearchParams} [params]
 */
export function useInfiniteBusinessSearch(params = {}) {
  const stable = { ...withoutOffset(params), limit: PAGE_SIZE };
  return useInfiniteQuery({
    queryKey: qk.businesses(stable),
    queryFn: ({ pageParam = 0 }) =>
      searchBusinesses({ ...stable, limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length < PAGE_SIZE ? undefined : lastPageParam + PAGE_SIZE,
  });
}

/**
 * Infinite product search — pages of 20 via offset; limit never grows.
 * @param {import('../services/contract.js').SearchParams} [params]
 */
export function useInfiniteProductSearch(params = {}) {
  const stable = { ...withoutOffset(params), limit: PAGE_SIZE };
  return useInfiniteQuery({
    queryKey: qk.products(stable),
    queryFn: ({ pageParam = 0 }) =>
      searchProducts({ ...stable, limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length < PAGE_SIZE ? undefined : lastPageParam + PAGE_SIZE,
  });
}

/**
 * Business detail by slug.
 * @param {string|undefined} slug
 * @param {{ lat: number, lng: number }|null} [near]
 */
export function useBusiness(slug, near) {
  return useQuery({
    queryKey: qk.business(slug, near),
    queryFn: () => getBusinessBySlug(slug, { near }),
    enabled: !!slug,
  });
}

/**
 * Product detail by id.
 * @param {string|undefined} id
 * @param {{ lat: number, lng: number }|null} [near]
 */
export function useProduct(id, near) {
  return useQuery({
    queryKey: qk.product(id, near),
    queryFn: () => getProductById(id, { near }),
    enabled: !!id,
  });
}

/**
 * Reviews for a business.
 * @param {string|undefined} businessId
 * @param {{ limit?: number, offset?: number }} [page]
 */
export function useReviews(businessId, page = {}) {
  return useQuery({
    queryKey: qk.reviews(businessId, page),
    queryFn: () => listReviews(businessId, page),
    enabled: !!businessId,
  });
}
