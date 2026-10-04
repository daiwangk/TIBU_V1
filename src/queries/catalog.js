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
import { useSearchOrigin } from '../stores/location.js';

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
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useCategory(slug, options = {}) {
  return useQuery({
    ...options,
    queryKey: [...qk.categories, slug],
    queryFn: () => getCategory(slug),
    enabled: !!slug && (options.enabled ?? true),
  });
}

/**
 * One-shot business search.
 * @param {import('../services/contract.js').SearchParams} [params] undefined or omitted = use the stored origin; null = no origin.
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useBusinessSearch(params = {}, options = {}) {
  const origin = useSearchOrigin();
  const searchParams = { ...params };
  if (searchParams.near === undefined) {
    searchParams.near = origin;
  }
  return useQuery({
    ...options,
    queryKey: qk.businesses(searchParams),
    queryFn: () => searchBusinesses(searchParams),
  });
}

/**
 * One-shot product search.
 * @param {import('../services/contract.js').SearchParams} [params] undefined or omitted = use the stored origin; null = no origin.
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useProductSearch(params = {}, options = {}) {
  const origin = useSearchOrigin();
  const searchParams = { ...params };
  if (searchParams.near === undefined) {
    searchParams.near = origin;
  }
  return useQuery({
    ...options,
    queryKey: qk.products(searchParams),
    queryFn: () => searchProducts(searchParams),
  });
}

/**
 * Infinite business search — pages of 20 via offset; limit never grows.
 * @param {import('../services/contract.js').SearchParams} [params] undefined or omitted = use the stored origin; null = no origin.
 */
export function useInfiniteBusinessSearch(params = {}) {
  const origin = useSearchOrigin();
  const searchParams = { ...params };
  if (searchParams.near === undefined) {
    searchParams.near = origin;
  }
  const stable = { ...withoutOffset(searchParams), limit: PAGE_SIZE };
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
 * @param {import('../services/contract.js').SearchParams} [params] undefined or omitted = use the stored origin; null = no origin.
 */
export function useInfiniteProductSearch(params = {}) {
  const origin = useSearchOrigin();
  const searchParams = { ...params };
  if (searchParams.near === undefined) {
    searchParams.near = origin;
  }
  const stable = { ...withoutOffset(searchParams), limit: PAGE_SIZE };
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
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useBusiness(slug, near, options = {}) {
  const origin = useSearchOrigin();
  const effectiveNear = near === undefined ? origin : near;
  return useQuery({
    ...options,
    queryKey: qk.business(slug, effectiveNear),
    queryFn: () => getBusinessBySlug(slug, { near: effectiveNear }),
    enabled: !!slug && (options.enabled ?? true),
  });
}

/**
 * Product detail by id.
 * @param {string|undefined} id
 * @param {{ lat: number, lng: number }|null} [near]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useProduct(id, near, options = {}) {
  const origin = useSearchOrigin();
  const effectiveNear = near === undefined ? origin : near;
  return useQuery({
    ...options,
    queryKey: qk.product(id, effectiveNear),
    queryFn: () => getProductById(id, { near: effectiveNear }),
    enabled: !!id && (options.enabled ?? true),
  });
}

/**
 * Reviews for a business.
 * @param {string|undefined} businessId
 * @param {{ limit?: number, offset?: number }} [page]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useReviews(businessId, page = {}, options = {}) {
  return useQuery({
    ...options,
    queryKey: qk.reviews(businessId, page),
    queryFn: () => listReviews(businessId, page),
    enabled: !!businessId && (options.enabled ?? true),
  });
}
