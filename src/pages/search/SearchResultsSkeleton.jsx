import Skeleton from '../../components/ui/Skeleton';

/**
 * Loading skeleton shaped like the Search results list:
 * full-width `ProductCard` (square image + name, price, seller) or `BusinessCard` (logo + text).
 *
 * @param {{ tab: 'products' | 'businesses' }} props
 */
export default function SearchResultsSkeleton({ tab }) {
  return (
    <div className="flex flex-col gap-4 px-screen py-6" aria-busy="true" aria-label="Loading results">
      {tab === 'products'
        ? Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="flex w-full flex-col overflow-hidden rounded-card border border-border bg-surface"
            >
              <Skeleton variant="rect" className="aspect-square w-full rounded-none" />
              <div className="flex flex-col gap-1 p-2">
                <Skeleton variant="rect" className="h-4 w-full" />
                <Skeleton variant="rect" className="h-4 w-3/4" />
                <Skeleton variant="rect" className="h-4 w-12" />
                <Skeleton variant="rect" className="h-3 w-24" />
              </div>
            </div>
          ))
        : Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="flex w-full items-center gap-3 rounded-card border border-border bg-surface p-3"
            >
              <Skeleton variant="rect" className="h-14 w-14 flex-shrink-0 rounded-card" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Skeleton variant="rect" className="h-4 w-3/4" />
                <Skeleton variant="rect" className="h-3 w-1/2" />
                <Skeleton variant="rect" className="h-3 w-2/3" />
                <Skeleton variant="rect" className="h-3 w-16" />
              </div>
            </div>
          ))}
    </div>
  );
}
