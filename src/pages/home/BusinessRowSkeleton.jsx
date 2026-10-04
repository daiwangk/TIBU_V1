const PULSE = 'block rounded bg-border motion-safe:animate-pulse';

/**
 * Skeletons matching `BusinessCard` at the Home row width (288px: logo + 4 text lines).
 * @param {{ count?: number }} props
 */
export default function BusinessRowSkeleton({ count = 2 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      aria-hidden="true"
      className="flex w-72 flex-shrink-0 items-center gap-3 rounded-card border border-border bg-surface p-3"
    >
      <span className="block h-14 w-14 flex-shrink-0 rounded-card bg-border motion-safe:animate-pulse" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={`${PULSE} h-4 w-3/4`} />
        <span className={`${PULSE} h-3 w-1/2`} />
        <span className={`${PULSE} h-3 w-2/3`} />
        <span className={`${PULSE} h-3 w-16`} />
      </div>
    </div>
  ));
}
