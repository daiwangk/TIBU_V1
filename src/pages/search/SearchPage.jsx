import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, X, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import ProductCard from '../../components/ProductCard';
import BusinessCard from '../../components/BusinessCard';
import ProductRowSkeleton from '../home/ProductRowSkeleton';
import BusinessRowSkeleton from '../home/BusinessRowSkeleton';
import SearchFiltersSheet from './SearchFiltersSheet';
import RecentSearches from './RecentSearches';
import { useInfiniteProductSearch, useInfiniteBusinessSearch } from '../../queries/catalog';
import { useSearchOrigin } from '../../stores/location';
import { readJSON, writeJSON } from '../../lib/storage';

const STORAGE_KEY = 'tibu.recentSearches';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const origin = useSearchOrigin();

  // URL State extraction
  const q = searchParams.get('q') || '';
  const tab = searchParams.get('tab') === 'businesses' ? 'businesses' : 'products';
  const category = searchParams.get('cat') || '';
  const availableToday = searchParams.get('today') === '1';
  const sortParam = searchParams.get('sort') || undefined;
  const price = searchParams.get('price') || '';
  const searchPrice = tab === 'products' ? price : '';

  // Local state
  const [localQ, setLocalQ] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sync back button / external changes to local input
  if (q !== prevQ) {
    setPrevQ(q);
    setLocalQ(q);
  }

  // Debounce input to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localQ !== q) {
        const next = new URLSearchParams(searchParams);
        if (localQ) next.set('q', localQ);
        else next.delete('q');
        setSearchParams(next, { replace: true });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localQ, q, searchParams, setSearchParams]);

  // Parse price
  const [minPrice, maxPrice] = useMemo(() => {
    if (!price || tab !== 'products') return [undefined, undefined];
    const [min, max] = price.split('-');
    return [
      min ? parseInt(min, 10) : undefined,
      max ? parseInt(max, 10) : undefined
    ];
  }, [price, tab]);

  // Sort sanitization
  const validSort = useMemo(() => {
    if (!sortParam) return undefined;
    if (sortParam === 'distance' && !origin) return undefined;
    const allowed = tab === 'businesses'
      ? ['distance', 'newest', 'rating']
      : ['distance', 'newest', 'price_asc', 'price_desc'];
    return allowed.includes(sortParam) ? sortParam : undefined;
  }, [sortParam, origin, tab]);

  const productSort = tab === 'products' ? validSort : undefined;
  const businessSort = tab === 'businesses' ? validSort : undefined;

  // Queries
  const productSearch = useInfiniteProductSearch({
    q: q || undefined,
    category: category || undefined,
    availableToday,
    ...(productSort ? { sort: productSort } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
    limit: 20
  });

  const businessSearch = useInfiniteBusinessSearch({
    q: q || undefined,
    category: category || undefined,
    availableToday,
    ...(businessSort ? { sort: businessSort } : {}),
    limit: 20
  });

  const query = tab === 'products' ? productSearch : businessSearch;
  const isSearching = !!(q || category || availableToday || validSort || searchPrice);

  // Save to recent searches when query resolves and q.length >= 2
  const savedQRef = useRef(new Set());
  useEffect(() => {
    if (q.length >= 2 && query.isSuccess && !savedQRef.current.has(q)) {
      savedQRef.current.add(q);
      const recent = readJSON(STORAGE_KEY, []);
      const filtered = recent.filter(s => s.toLowerCase() !== q.toLowerCase());
      filtered.unshift(q);
      writeJSON(STORAGE_KEY, filtered.slice(0, 8));
    }
  }, [q, query.isSuccess]);

  function handleTabChange(newTab) {
    if (newTab === tab) return;
    const next = new URLSearchParams(searchParams);
    next.set('tab', newTab);

    // Drop incompatible sort
    const currentSort = next.get('sort');
    if (newTab === 'businesses' && (currentSort === 'price_asc' || currentSort === 'price_desc')) {
      next.delete('sort');
    } else if (newTab === 'products' && currentSort === 'rating') {
      next.delete('sort');
    }

    // Drop price if businesses
    if (newTab === 'businesses') {
      next.delete('price');
    }

    setSearchParams(next, { replace: true });
  }

  function handleFilterChange(filters) {
    const next = new URLSearchParams(searchParams);
    if (filters.category) next.set('cat', filters.category); else next.delete('cat');
    if (filters.availableToday) next.set('today', '1'); else next.delete('today');
    if (filters.sort) next.set('sort', filters.sort); else next.delete('sort');
    if (filters.price && tab === 'products') next.set('price', filters.price); else next.delete('price');
    setSearchParams(next, { replace: true });
  }

  function handleResetFilters() {
    const next = new URLSearchParams(searchParams);
    next.delete('cat');
    next.delete('today');
    next.delete('sort');
    next.delete('price');
    setSearchParams(next, { replace: true });
  }

  function handleSearchInputSelect(selectedQ) {
    setLocalQ(selectedQ);
    const next = new URLSearchParams(searchParams);
    next.set('q', selectedQ);
    setSearchParams(next, { replace: true });
  }

  // Calculate active filter count
  let filterCount = 0;
  if (category) filterCount++;
  if (availableToday) filterCount++;
  if (validSort) filterCount++;
  if (searchPrice) filterCount++;

  const items = useMemo(() => query.data?.pages.flat() || [], [query.data]);

  const hasMore = query.hasNextPage;
  const isFetchingNext = query.isFetchingNextPage;

  function getCountLabel(query) {
    if (query.isPending || query.isError) return '';
    const arr = query.data?.pages.flat() || [];
    return query.hasNextPage ? ` (${arr.length}+)` : ` (${arr.length})`;
  }

  return (
    <main className="flex flex-col min-h-screen pb-safe">
      <header className="sticky top-0 z-30 flex flex-col bg-surface shadow-sm px-screen pt-4 pb-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <IconButton
              label="Go back"
              onClick={() => navigate(-1)}
              className="-ml-2"
            >
              <ArrowLeft size={20} strokeWidth={1.75} aria-hidden="true" />
            </IconButton>

            <div className="relative flex-1">
              <Search
                size={20}
                strokeWidth={1.75}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="search"
                autoFocus
                placeholder="Search cakes, crochet, candles?"
                value={localQ}
                onChange={e => setLocalQ(e.target.value)}
                className="w-full min-h-12 rounded-btn border border-border bg-surface pl-10 pr-10 font-body text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-safe:transition-shadow motion-safe:duration-150"
              />
              {localQ && (
                <button
                  type="button"
                  onClick={() => { setLocalQ(''); setSearchParams(prev => { prev.delete('q'); return prev; }, { replace: true }); }}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-btn"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-label="Open filters"
              className="relative -mr-2 flex min-h-11 min-w-11 items-center justify-center text-ink hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-btn"
            >
              <SlidersHorizontal size={24} strokeWidth={1.75} aria-hidden="true" />
              {filterCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-fg">
                  {filterCount}
                </span>
              )}
            </button>
          </div>

          {isSearching && (
            <Tabs
              value={tab}
              onChange={handleTabChange}
              items={[
                { value: 'products', label: `Products${getCountLabel(productSearch)}` },
                { value: 'businesses', label: `Businesses${getCountLabel(businessSearch)}` }
              ]}
            />
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        {!isSearching ? (
          <RecentSearches onSelect={handleSearchInputSelect} />
        ) : query.isPending ? (
          <div className="flex flex-col gap-4 px-screen py-6">
            {Array.from({ length: 4 }).map((_, i) => (
              tab === 'products' ? (
                <ProductRowSkeleton key={i} />
              ) : (
                <BusinessRowSkeleton key={i} />
              )
            ))}
          </div>
        ) : query.isError ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <ErrorState message="We couldn't load the search results." onRetry={() => query.refetch()} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <EmptyState
              icon={<Search size={28} strokeWidth={1.75} aria-hidden="true" />}
              title={q ? `No results for "${q}".` : 'No results for these filters.'}
              text="Try adjusting your filters or searching for something else."
              action={filterCount > 0 ? { label: 'Reset filters', onClick: handleResetFilters } : undefined}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-6 px-screen py-6">
            <div className="flex flex-col gap-4">
              {items.map(item => (
                tab === 'products' ? (
                  <ProductCard key={item.id} product={item} />
                ) : (
                  <BusinessCard key={item.id} business={item} />
                )
              ))}
            </div>

            {hasMore && (
              <Button
                variant="outline"
                onClick={() => query.fetchNextPage()}
                disabled={isFetchingNext}
                className="w-full"
              >
                {isFetchingNext ? 'Loading...' : 'Load more'}
              </Button>
            )}
          </div>
        )}
      </div>

      <SearchFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        tab={tab}
        filters={{ category, availableToday, sort: validSort || '', price: searchPrice }}
        onChange={handleFilterChange}
      />
    </main>
  );
}
