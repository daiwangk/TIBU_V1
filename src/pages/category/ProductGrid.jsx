import { PackageOpen } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import { useInfiniteProductSearch } from '../../queries/catalog';

/**
 * Infinite product grid for the category page.
 *
 * @param {{ params: import('../../services/contract').SearchParams }} props
 */
export default function ProductGrid({ params }) {
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProductSearch(params);

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-3 px-screen" aria-busy="true" aria-label="Loading products">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2" aria-hidden="true">
            <Skeleton variant="rect" className="w-full aspect-square rounded-card" />
            <Skeleton variant="text" lines={2} />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="We couldn't load products. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  const allProducts = data?.pages.flat() ?? [];

  if (allProducts.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen size={28} strokeWidth={1.5} aria-hidden="true" />}
        title="No products found"
        text="Try changing the filters or check back later."
      />
    );
  }

  return (
    <section aria-label="Products" className="flex flex-col gap-4 pb-8">
      <div className="grid grid-cols-2 gap-3 px-screen">
        {allProducts.map((product) => (
          <ProductCard key={product.id} product={product} variant="grid" />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center px-screen">
          <Button
            variant="secondary"
            size="md"
            loading={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            aria-label="Load more products"
          >
            Load more
          </Button>
        </div>
      )}
    </section>
  );
}
