import Skeleton from '../../components/ui/Skeleton';

/** Loading placeholder for a list of ActivityRows. */
export default function ActivityListSkeleton({ label }) {
  return (
    <ul className="flex flex-col gap-3" aria-busy="true" aria-label={label}>
      {[0, 1, 2, 3, 4].map((i) => (
        <li key={i} className="flex items-center gap-3 rounded-card border border-border bg-surface p-3" aria-hidden="true">
          <Skeleton className="h-14 w-14 rounded-card" />
          <div className="flex-1">
            <Skeleton variant="text" lines={2} />
          </div>
        </li>
      ))}
    </ul>
  );
}
