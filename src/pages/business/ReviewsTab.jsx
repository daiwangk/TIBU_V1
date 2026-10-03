import { MessageSquare, Star } from 'lucide-react';
import { toast } from 'sonner';
import { formatRating, formatRelativeTime } from '../../lib/format';
import { useReviews } from '../../queries/catalog';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';

/**
 * @param {{ business: import('../../services/contract').BusinessDetail }} props
 */
export default function ReviewsTab({ business }) {
  const { data: reviews, isLoading, isError, refetch } = useReviews(business.id);

  function handleWriteReview() {
    toast('Reviews open with accounts');
  }

  return (
    <div className="pt-6 pb-8 space-y-6">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl font-heading font-bold text-ink">
            {formatRating(business.rating, business.reviewCount)}
          </div>
          <div className="flex flex-col">
            <div className="flex text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  strokeWidth={0}
                  fill={i < Math.round(business.rating) ? 'currentColor' : 'var(--color-border)'}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-sm font-body text-muted mt-1">
              {business.reviewCount} {business.reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleWriteReview}>
          Write a review
        </Button>
      </div>

      <hr className="border-border" />

      {/* List */}
      <div className="space-y-6">
        {isLoading && (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton variant="text" lines={1} className="w-24 h-4" />
                  <Skeleton variant="text" lines={1} className="w-16 h-3" />
                </div>
                <Skeleton variant="text" lines={2} />
              </div>
            ))}
          </div>
        )}

        {isError && <ErrorState onRetry={() => refetch()} />}

        {!isLoading && !isError && reviews?.length === 0 && (
          <EmptyState
            icon={<MessageSquare size={32} aria-hidden="true" />}
            title="No reviews yet"
            text="Be the first to review this business!"
          />
        )}

        {!isLoading && !isError && reviews?.length > 0 && (
          <ul className="space-y-6">
            {reviews.map((rev) => (
              <li key={rev.id} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-semibold text-ink text-sm">
                    {rev.reviewerName}
                  </span>
                  <span className="text-muted text-xs mx-1">•</span>
                  <span className="text-muted text-xs">
                    {formatRelativeTime(rev.createdAt)}
                  </span>
                </div>
                <div className="flex text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      strokeWidth={0}
                      fill={i < rev.rating ? 'currentColor' : 'var(--color-border)'}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="font-body text-sm text-body leading-relaxed">
                  {rev.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
