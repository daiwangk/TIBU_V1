import { Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import ProductCard from '../../components/ProductCard';
import BusinessCard from '../../components/BusinessCard';
import SaveButton from '../../components/SaveButton';
import SearchResultsSkeleton from './SearchResultsSkeleton';

/**
 * Search results body with the four data states: products as a 2-column grid, businesses as a list,
 * and "Load more" while there are further pages. Presentational only — SearchPage owns the queries.
 *
 * @param {{
 *   tab: 'products' | 'businesses',
 *   query: { isPending: boolean, isError: boolean, refetch: () => unknown, fetchNextPage: () => unknown, hasNextPage?: boolean, isFetchingNextPage: boolean },
 *   items: any[],
 *   q: string,
 *   filterCount: number,
 *   onResetFilters: () => void,
 *   onOpenResult: () => void,   // called when a result link is opened (remembers the search)
 * }} props
 */
export default function SearchResults({ tab, query, items, q, filterCount, onResetFilters, onOpenResult }) {
  if (query.isPending) return <SearchResultsSkeleton tab={tab} />;

  if (query.isError) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <ErrorState message="We couldn't load the search results." onRetry={() => query.refetch()} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <EmptyState
          icon={<Search size={28} strokeWidth={1.75} aria-hidden="true" />}
          title={q ? `No results for "${q}".` : 'No results for these filters.'}
          text="Try adjusting your filters or searching for something else."
          action={filterCount > 0 ? { label: 'Reset filters', onClick: onResetFilters } : undefined}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-6 px-screen py-6"
      onClickCapture={(e) => { if (e.target instanceof Element && e.target.closest('a')) onOpenResult(); }}
    >
      {tab === 'products' ? (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <ProductCard key={item.id} product={item} action={<SaveButton kind="product" id={item.id} overlay />} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <BusinessCard key={item.id} business={item} action={<SaveButton kind="business" id={item.id} />} />
          ))}
        </div>
      )}

      {query.hasNextPage && (
        <Button
          variant="secondary"
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
          className="w-full"
        >
          {query.isFetchingNextPage ? 'Loading...' : 'Load more'}
        </Button>
      )}
    </div>
  );
}
