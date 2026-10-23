import ErrorState from '../../components/ui/ErrorState';
import Rating from '../../components/Rating';
import Skeleton from '../../components/ui/Skeleton';
import { useMyStats } from '../../queries/seller';

function StatCard({ label, children, note }) {
  return (
    <li className="flex flex-col gap-1 rounded-card border border-border bg-surface p-4">
      <span className="font-body text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      <span className="font-heading text-2xl font-bold text-ink">{children}</span>
      {note && <span className="font-body text-xs text-body">{note}</span>}
    </li>
  );
}

/**
 * The seller's basic figures from `my_business_stats()` (CONTRACT §5): how many customers reached out,
 * by WhatsApp and by call, saves, open enquiries and the rating.
 */
export default function SellerStats() {
  const { data: stats, isLoading, isError, error, refetch } = useMyStats();

  return (
    <section aria-labelledby="seller-stats" className="flex flex-col gap-3">
      <h2 id="seller-stats" className="font-heading text-lg font-bold text-ink">Your shop in numbers</h2>
      {isLoading && (
        <div className="grid grid-cols-2 gap-3" role="status" aria-label="Loading figures">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}
      {isError && !stats && <ErrorState error={error} onRetry={() => refetch()} className="py-4" />}
      {stats && (
        <ul className="grid grid-cols-2 gap-3">
          <StatCard label="Contacts · 30 days" note={`${stats.contacts7d} in the last 7 days`}>{stats.contacts30d}</StatCard>
          <StatCard label="WhatsApp taps · 30 days">{stats.whatsapp30d}</StatCard>
          <StatCard label="Calls · 30 days">{stats.calls30d}</StatCard>
          <StatCard label="Saves">{stats.saves}</StatCard>
          <StatCard label="Open enquiries">{stats.openEnquiries}</StatCard>
          <StatCard label="Rating" note={stats.reviewCount === 0 ? 'No reviews yet' : undefined}>
            {stats.reviewCount === 0 ? '—' : <Rating rating={stats.rating} reviewCount={stats.reviewCount} />}
          </StatCard>
        </ul>
      )}
    </section>
  );
}
