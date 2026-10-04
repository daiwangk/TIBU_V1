import { Store } from 'lucide-react';
import BusinessCard from '../../components/BusinessCard';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import { useInfiniteBusinessSearch } from '../../queries/catalog';

/**
 * Infinite business list for the category page.
 *
 * @param {{ params: import('../../services/contract').SearchParams }} props
 */
export default function BusinessList({ params }) {
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteBusinessSearch(params);

  if (isPending) {
    return (
      <div className="flex flex-col gap-3 px-screen" aria-busy="true" aria-label="Loading businesses">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-card border border-border" aria-hidden="true">
            <Skeleton variant="circle" size="lg" />
            <div className="flex-1">
              <Skeleton variant="text" lines={3} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="We couldn't load businesses. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  const allBusinesses = data?.pages.flat() ?? [];

  if (allBusinesses.length === 0) {
    return (
      <EmptyState
        icon={<Store size={28} strokeWidth={1.5} aria-hidden="true" />}
        title="No businesses found"
        text="Try changing the filters or check back later."
      />
    );
  }

  return (
    <section aria-label="Businesses" className="flex flex-col gap-4 pb-8">
      <div className="flex flex-col gap-3 px-screen">
        {allBusinesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center px-screen">
          <Button
            variant="secondary"
            size="md"
            loading={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            aria-label="Load more businesses"
          >
            Load more
          </Button>
        </div>
      )}
    </section>
  );
}
