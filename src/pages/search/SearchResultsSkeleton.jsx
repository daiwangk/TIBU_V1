import Skeleton from '../../components/ui/Skeleton';

/**
 * Loading skeleton shaped like the Search results:
 * a 2-column grid of `ProductCard`s (square image + name, price, seller) or a list of `BusinessCard`s (logo + text).
 *
 * @param {{ tab: 'products' | 'businesses' }} props
 */
export default function SearchResultsSkeleton({ tab }) {
  return (
    <div
      className={`px-screen py-6 ${tab === 'products' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}`}
      aria-busy="true"
      aria-label="Loading results"
    >
      {tab === 'products'
        ? Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="flex w-full flex-col overflow-hidden rounded-card border border-border bg-surface"
            >
              <Skeleton variant="rect" className="aspect-square w-full rounded-none" />
              <div className="flex flex-col gap-1 p-2.5">
                <Skeleton variant="rect" className="h-4 w-full" />
                <Skeleton variant="rect" className="h-4 w-3/4" />
                <Skeleton variant="rect" className="h-5 w-16" />
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
