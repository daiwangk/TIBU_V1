import Skeleton from '../../components/ui/Skeleton';

/**
 * Loading skeleton matching the ProductPage layout.
 */
export default function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between px-screen py-3 bg-surface border-b border-border sticky top-0 z-10">
        <Skeleton variant="circle" size="sm" />
        <Skeleton variant="rect" className="h-5 w-24 rounded" />
        <Skeleton variant="circle" size="sm" />
      </div>

      <div className="px-screen pt-3 space-y-4">
        {/* Gallery skeleton */}
        <Skeleton variant="rect" className="aspect-square w-full rounded-card" />

        {/* Business row skeleton */}
        <div className="flex items-center gap-3 py-2 border-b border-border">
          <Skeleton variant="circle" size="md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton variant="rect" className="h-4 w-32 rounded" />
            <Skeleton variant="rect" className="h-3 w-24 rounded" />
          </div>
        </div>

        {/* Title and price skeleton */}
        <div className="space-y-2 pt-1">
          <Skeleton variant="rect" className="h-6 w-3/4 rounded" />
          <Skeleton variant="rect" className="h-8 w-1/3 rounded" />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2 pt-2">
          <Skeleton variant="rect" className="h-4 w-28 rounded" />
          <Skeleton variant="text" lines={3} />
        </div>

        {/* Details skeleton */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Skeleton variant="rect" className="h-16 rounded-card" />
          <Skeleton variant="rect" className="h-16 rounded-card" />
        </div>
      </div>

      {/* Bottom bar skeleton */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-surface/95 backdrop-blur-sm border-t border-border px-screen py-3 z-20 flex gap-3">
        <Skeleton variant="rect" className="h-11 flex-1 rounded-btn" />
        <Skeleton variant="rect" className="h-11 flex-1 rounded-btn" />
      </div>
    </div>
  );
}
