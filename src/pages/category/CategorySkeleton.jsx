import Skeleton from '../../components/ui/Skeleton';

/** Loading skeleton for the category page — chips + card grid. */
export default function CategorySkeleton() {
  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Sub-category chips skeleton */}
      <div className="flex gap-2 overflow-hidden px-screen" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rect" className="h-9 w-20 rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* Tab toggle skeleton */}
      <div className="flex gap-2 px-screen" aria-hidden="true">
        <Skeleton variant="rect" className="h-9 w-28 rounded-full flex-shrink-0" />
        <Skeleton variant="rect" className="h-9 w-28 rounded-full flex-shrink-0" />
      </div>

      {/* Filters row skeleton */}
      <div className="flex gap-2 overflow-hidden px-screen" aria-hidden="true">
        <Skeleton variant="rect" className="h-9 w-24 rounded-full flex-shrink-0" />
        <Skeleton variant="rect" className="h-9 w-28 flex-shrink-0" />
        <Skeleton variant="rect" className="h-9 w-28 flex-shrink-0" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 gap-3 px-screen" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton variant="rect" className="w-full aspect-square rounded-card" />
            <Skeleton variant="text" lines={2} />
          </div>
        ))}
      </div>
    </div>
  );
}
