import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchHeader from './SearchHeader';
import SearchResults from './SearchResults';
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
  const q = (searchParams.get('q') || '').trim();
  const tab = searchParams.get('tab') === 'businesses' ? 'businesses' : 'products';
  const category = searchParams.get('cat') || '';
  const availableToday = searchParams.get('today') === '1';
  const sortParam = searchParams.get('sort') || undefined;
  const price = searchParams.get('price') || '';
  const searchPrice = tab === 'products' && /^(\d{1,7})?-(\d{1,7})?$/.test(price) && price !== '-' ? price : '';

  // Local state
  const [localQ, setLocalQ] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  const [pushedQ, setPushedQ] = useState(q);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sync back button / external changes to the input — but not our own debounced push coming back
  // (the user may already have typed more by then).
  if (q !== prevQ) {
    setPrevQ(q);
    if (q !== pushedQ) {
      setPushedQ(q);
      setLocalQ(q);
    }
  }

  // Debounce input to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      const typed = localQ.trim();
      if (typed !== q) {
        setPushedQ(typed);
        const next = new URLSearchParams(searchParams);
        if (typed) next.set('q', typed);
        else next.delete('q');
        setSearchParams(next, { replace: true });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localQ, q, searchParams, setSearchParams]);

  // Parse price
  const [minPrice, maxPrice] = useMemo(() => {
    // Only "min-max", "min-" or "-max" with whole rupees; anything else is ignored.
    const match = /^(\d{1,7})?-(\d{1,7})?$/.exec(price);
    if (!match || tab !== 'products' || (!match[1] && !match[2])) return [undefined, undefined];
    return [
      match[1] ? parseInt(match[1], 10) : undefined,
      match[2] ? parseInt(match[2], 10) : undefined,
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

  // Queries — idle screen (recent searches) makes no requests
  const isSearching = !!(q || category || availableToday || validSort || searchPrice);
  const productSearch = useInfiniteProductSearch({
    q: q || undefined,
    category: category || undefined,
    availableToday,
    ...(productSort ? { sort: productSort } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
    limit: 20
  }, { enabled: isSearching });

  const businessSearch = useInfiniteBusinessSearch({
    q: q || undefined,
    category: category || undefined,
    availableToday,
    ...(businessSort ? { sort: businessSort } : {}),
    limit: 20
  }, { enabled: isSearching });

  const query = tab === 'products' ? productSearch : businessSearch;

  // Remember a search only when the user commits to it (Enter or opening a result),
  // so typing "c", "ca", "cak" doesn't fill the list with prefixes.
  function saveRecent(text) {
    const term = text.trim();
    if (term.length < 2) return;
    const recent = readJSON(STORAGE_KEY, []);
    const filtered = recent.filter((s) => s.toLowerCase() !== term.toLowerCase());
    filtered.unshift(term);
    writeJSON(STORAGE_KEY, filtered.slice(0, 8));
  }

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
    setPushedQ(selectedQ);
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

  function getCountLabel(query) {
    if (query.isPending || query.isError) return '';
    const arr = query.data?.pages.flat() || [];
    return query.hasNextPage ? ` (${arr.length}+)` : ` (${arr.length})`;
  }

  return (
    <main className="flex flex-col min-h-screen pb-4">
      <SearchHeader
        value={localQ}
        onValueChange={setLocalQ}
        onEnter={() => saveRecent(localQ)}
        onClear={() => { setLocalQ(''); setSearchParams(prev => { prev.delete('q'); return prev; }, { replace: true }); }}
        onBack={() => navigate(-1)}
        onOpenFilters={() => setFiltersOpen(true)}
        filterCount={filterCount}
        tabs={isSearching ? {
          value: tab,
          onChange: handleTabChange,
          items: [
            { value: 'products', label: `Products${getCountLabel(productSearch)}` },
            { value: 'businesses', label: `Businesses${getCountLabel(businessSearch)}` }
          ],
        } : undefined}
      />

      <div className="flex-1 flex flex-col">
        {!isSearching ? (
          <RecentSearches onSelect={handleSearchInputSelect} />
        ) : (
          <SearchResults
            tab={tab}
            query={query}
            items={items}
            q={q}
            filterCount={filterCount}
            onResetFilters={handleResetFilters}
            onOpenResult={() => saveRecent(q)}
          />
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
