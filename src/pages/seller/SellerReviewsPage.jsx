/**
 * SellerReviewsPage — src/pages/seller/SellerReviewsPage.jsx
 *
 * /seller/reviews — SellerGate-wrapped page showing the seller's rating summary
 * (average + count from useMyBusiness) and a read-only list of all their reviews
 * via useReviews(business.id).
 *
 * All 4 states: loading (skeleton), empty (EmptyState), error (ErrorState + retry), data.
 */

import { MessageSquare, Star } from 'lucide-react';
import { formatRating, formatRelativeTime } from '../../lib/format';
import { useReviews } from '../../queries/catalog';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import SellerPage from './SellerPage';

const PAGE_SIZE = 20;

/** Rating summary card shown at the top. */
function RatingSummary({ rating, reviewCount }) {
  return (
    <section
      aria-label="Rating summary"
      className="flex items-center gap-4 rounded-card border border-border bg-surface px-5 py-4"
    >
      <div className="text-5xl font-heading font-bold text-ink leading-none">
        {formatRating(rating, reviewCount)}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={18}
              strokeWidth={0}
              fill={
                i < Math.round(rating)
                  ? 'var(--color-coral)'
                  : 'var(--color-border)'
              }
            />
          ))}
        </div>
        <span className="font-body text-sm text-muted">
          {reviewCount === 0
            ? 'No reviews yet'
            : `${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`}
        </span>
      </div>
    </section>
  );
}

/** A single read-only review row. */
function ReviewRow({ review }) {
  return (
    <li className="space-y-1.5 py-4 border-b border-border last:border-b-0">
      <div className="flex items-center gap-2">
        <span className="font-heading font-semibold text-ink text-sm">
          {review.reviewerName}
        </span>
        <span className="text-muted text-xs mx-1" aria-hidden="true">•</span>
        <span className="text-muted text-xs">{formatRelativeTime(review.createdAt)}</span>
      </div>
      <div className="flex text-primary" aria-hidden="true">
        <span className="sr-only">{`${review.rating} out of 5 stars`}</span>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            strokeWidth={0}
            fill={i < review.rating ? 'var(--color-coral)' : 'var(--color-border)'}
          />
        ))}
      </div>
      {review.body && (
        <p className="font-body text-sm text-body leading-relaxed">{review.body}</p>
      )}
    </li>
  );
}

/** Inner component that gets the loaded business as a prop from SellerPage. */
function ReviewsContent({ business }) {
  const { data: reviews, isLoading, isError, error, refetch } = useReviews(
    business.id,
    { limit: PAGE_SIZE },
  );

  return (
    <div className="space-y-6">
      <RatingSummary rating={business.rating} reviewCount={business.reviewCount} />

      <section aria-label="Customer reviews">
        {isLoading && (
          <div className="space-y-6" role="status" aria-label="Loading reviews">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 py-4 border-b border-border last:border-b-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-28 h-4" />
                  <Skeleton className="w-16 h-3" />
                </div>
                <Skeleton className="w-20 h-3" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        )}

        {isError && <ErrorState error={error} onRetry={() => refetch()} />}

        {!isLoading && !isError && reviews?.length === 0 && (
          <EmptyState
            icon={<MessageSquare size={32} aria-hidden="true" />}
            title="No reviews yet"
            text="Reviews from customers will appear here."
          />
        )}

        {!isLoading && !isError && reviews?.length > 0 && (
          <ul className="rounded-card border border-border bg-surface px-4">
            {reviews.map((rev) => (
              <ReviewRow key={rev.id} review={rev} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** /seller/reviews — SellerGate-wrapped; SellerPage handles loading + error for myBusiness. */
export default function SellerReviewsPage() {
  return (
    <SellerPage title="Reviews" backTo="/seller">
      {(business) => <ReviewsContent business={business} />}
    </SellerPage>
  );
}
