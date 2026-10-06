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

/** Every hook here backs a view that renders its own ErrorState, so the global error toast stays off. */
const PAGE_QUERY_META = { silent: true };

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
    meta: PAGE_QUERY_META,
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
    meta: PAGE_QUERY_META,
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
    meta: PAGE_QUERY_META,
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
    meta: PAGE_QUERY_META,
    queryKey: qk.products(searchParams),
    queryFn: () => searchProducts(searchParams),
  });
}

/**
 * Infinite business search — pages of 20 via offset; limit never grows.
 * @param {import('../services/contract.js').SearchParams} [params] undefined or omitted = use the stored origin; null = no origin.
 * @param {{ enabled?: boolean }} [options]
 */
export function useInfiniteBusinessSearch(params = {}, options = {}) {
  const origin = useSearchOrigin();
  const searchParams = { ...params };
  if (searchParams.near === undefined) {
    searchParams.near = origin;
  }
  const stable = { ...withoutOffset(searchParams), limit: PAGE_SIZE };
  return useInfiniteQuery({
    ...options,
    meta: PAGE_QUERY_META,
    // 'infinite' keeps this cache entry ({ pages, pageParams }) apart from a one-shot search with the same params.
    queryKey: [...qk.businesses(stable), 'infinite'],
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
 * @param {{ enabled?: boolean }} [options]
 */
export function useInfiniteProductSearch(params = {}, options = {}) {
  const origin = useSearchOrigin();
  const searchParams = { ...params };
  if (searchParams.near === undefined) {
    searchParams.near = origin;
  }
  const stable = { ...withoutOffset(searchParams), limit: PAGE_SIZE };
  return useInfiniteQuery({
    ...options,
    meta: PAGE_QUERY_META,
    queryKey: [...qk.products(stable), 'infinite'],
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
    meta: PAGE_QUERY_META,
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
    meta: PAGE_QUERY_META,
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
    meta: PAGE_QUERY_META,
    queryKey: qk.reviews(businessId, page),
    queryFn: () => listReviews(businessId, page),
    enabled: !!businessId && (options.enabled ?? true),
  });
}
