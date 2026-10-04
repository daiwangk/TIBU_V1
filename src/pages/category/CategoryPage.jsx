import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { useCategory, useCategories } from '../../queries/catalog';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import CategorySkeleton from './CategorySkeleton';
import CategoryFilters from './CategoryFilters';
import ProductGrid from './ProductGrid';
import BusinessList from './BusinessList';

/** Valid sort values per tab. Anything outside this set is dropped on tab change. */
const PRODUCT_SORT_VALUES = new Set(['distance', 'newest', 'price_asc', 'price_desc']);
const BUSINESS_SORT_VALUES = new Set(['distance', 'newest', 'rating']);

/**
 * Parse a `?price=` param value into { minPrice, maxPrice } rupee numbers.
 * @param {string} priceParam
 * @returns {{ minPrice?: number, maxPrice?: number }}
 */
function parsePriceParam(priceParam) {
  if (priceParam === 'u500') return { maxPrice: 500 };
  if (priceParam === '500-1000') return { minPrice: 500, maxPrice: 1000 };
  if (priceParam === 'a1000') return { minPrice: 1000 };
  return {};
}

/**
 * Category hub page — /category/:slug
 *
 * URL params:
 *   ?sub=   — sub-category chip selection
 *   ?tab=   — 'products' | 'businesses' (default 'products')
 *   ?sort=  — sort value; omitted = hook default (distance-if-near else newest)
 *   ?today= — '1' = availableToday: true
 *   ?price= — 'u500' | '500-1000' | 'a1000' (products only)
 */
export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL param reads
  const sub = searchParams.get('sub') || null;
  const tab = searchParams.get('tab') === 'businesses' ? 'businesses' : 'products';
  const sortParam = searchParams.get('sort') || '';
  const today = searchParams.get('today') === '1';
  const priceParam = searchParams.get('price') || '';

  // Category data
  const {
    data: category,
    isPending: catPending,
    isError: catError,
    refetch: catRefetch,
  } = useCategory(slug);

  // All categories — to find children of this category
  const { data: allCategories } = useCategories();

  // Children of this category
  const children = (allCategories ?? []).filter((c) => c.parentSlug === slug);

  // ── URL param setters (all replace: true) ──

  function setParam(key, value) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value == null || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      },
      { replace: true }
    );
  }

  function handleTabChange(newTab) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newTab === 'products') {
          next.delete('tab');
        } else {
          next.set('tab', newTab);
        }
        // Drop sort if not valid for new tab
        const validSorts = newTab === 'products' ? PRODUCT_SORT_VALUES : BUSINESS_SORT_VALUES;
        const currentSort = next.get('sort');
        if (currentSort && !validSorts.has(currentSort)) {
          next.delete('sort');
        }
        // Price is products-only; clean up when switching to businesses
        if (newTab === 'businesses') {
          next.delete('price');
        }
        return next;
      },
      { replace: true }
    );
  }

  function handleSubChange(newSub) {
    setParam('sub', newSub);
  }

  function handleSortChange(newSort) {
    setParam('sort', newSort);
  }

  function handleTodayChange(v) {
    setParam('today', v ? '1' : null);
  }

  function handlePriceChange(v) {
    setParam('price', v || null);
  }

  // ── Loading state ──
  if (catPending) {
    return (
      <div className="flex flex-col">
        <div className="h-[52px] bg-surface border-b border-border animate-pulse" aria-hidden="true" />
        <CategorySkeleton />
      </div>
    );
  }

  // ── Error fetching category ──
  if (catError) {
    return (
      <ErrorState
        message="We couldn't load this category."
        onRetry={() => catRefetch()}
        className="mt-16"
      />
    );
  }

  // ── Not found (null returned by getCategory) ──
  if (category == null) {
    return (
      <EmptyState
        icon={<Tag size={28} strokeWidth={1.5} aria-hidden="true" />}
        title="Category not found"
        text="This category doesn't exist or may have moved."
        action={{ label: 'Go Home', onClick: () => navigate('/') }}
        className="mt-16"
      />
    );
  }

  // ── Effective category slug for search ──
  // When sub is selected, search by sub; otherwise search by parent slug
  // (CONTRACT §2: "Filtering by a parent slug includes its children")
  const effectiveCategory = sub ?? slug;

  // ── Build search params ──
  /** @type {import('../../services/contract').SearchParams} */
  const searchBase = {
    category: effectiveCategory,
    availableToday: today ? true : false,
    ...(sortParam ? { sort: sortParam } : {}),
  };

  const productParams = {
    ...searchBase,
    ...parsePriceParam(priceParam),
  };

  const businessParams = { ...searchBase };

  return (
    <div className="flex flex-col pb-4">
      <PageHeader title={category.name} fallbackTo="/" />

      <CategoryFilters
        tab={tab}
        onTabChange={handleTabChange}
        children={children}
        sub={sub}
        onSubChange={handleSubChange}
        sort={sortParam}
        onSortChange={handleSortChange}
        today={today}
        onTodayChange={handleTodayChange}
        price={priceParam}
        onPriceChange={handlePriceChange}
      />

      <div className="mt-4" role="tabpanel" aria-labelledby={tab === 'products' ? 'tab-products' : 'tab-businesses'}>
        {tab === 'products' ? (
          <ProductGrid params={productParams} />
        ) : (
          <BusinessList params={businessParams} />
        )}
      </div>
    </div>
  );
}
