const PULSE = 'block rounded bg-border motion-safe:animate-pulse';

/**
 * Skeletons matching `ProductCard variant="row"` (160px wide, square image, 2-line name, price, seller).
 * @param {{ count?: number }} props
 */
export default function ProductRowSkeleton({ count = 3 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      aria-hidden="true"
      className="flex w-40 flex-shrink-0 flex-col overflow-hidden rounded-card border border-border bg-surface"
    >
      <span className="block aspect-square w-full bg-border motion-safe:animate-pulse" />
      <div className="flex flex-col gap-1 p-2">
        <span className={`${PULSE} h-4 w-full`} />
        <span className={`${PULSE} h-4 w-3/4`} />
        <span className={`${PULSE} h-4 w-12`} />
        <span className={`${PULSE} h-3 w-20`} />
      </div>
    </div>
  ));
}
