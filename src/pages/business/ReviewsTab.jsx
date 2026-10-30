/**
 * ReviewsTab — src/pages/business/ReviewsTab.jsx
 *
 * Displays the review list for a business and a "Write a review" / "Edit your review"
 * button that:
 *   - guests: fires loginGate.request({ type: 'review', ... }) and opens the login sheet
 *   - authenticated non-owners: opens ReviewSheet (prefilled if they already have a review)
 *   - owners: button is hidden (determined via useMyBusiness; public shapes carry no owner id)
 *
 * After login the gate handler (registered in src/queries/reviews.js) sets a pending business id
 * in reviewSheetStore, which this component watches to auto-open the sheet.
 */

import { useState } from 'react';
import { MessageSquare, Star } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { formatRating, formatRelativeTime } from '../../lib/format';
import { useReviews } from '../../queries/catalog';
import { useMyReview, useReviewSheetStore } from '../../queries/reviews';
import { useMyBusiness } from '../../queries/seller';
import { useAuthStore } from '../../stores/auth';
import { useLoginGateStore } from '../../stores/loginGate';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import ReviewSheet from '../../components/ReviewSheet';
import Skeleton from '../../components/ui/Skeleton';

/**
 * @param {{ business: import('../../services/contract.js').BusinessDetail }} props
 */
export default function ReviewsTab({ business }) {
  const location = useLocation();
  const authStatus = useAuthStore((s) => s.status);
  const loginGate = useLoginGateStore();
  const isAuthenticated = authStatus === 'authenticated';

  const { data: reviews, isLoading, isError, error, refetch } = useReviews(business.id);

  // My existing review (null if none; only fetches when authenticated)
  const { data: myReview } = useMyReview(isAuthenticated ? business.id : undefined);

  // Is the viewer the business owner? useMyBusiness returns null for customers.
  const { data: myBusiness } = useMyBusiness();
  const isOwner = !!myBusiness && myBusiness.id === business.id;

  // ReviewSheet open state
  const [userOpened, setUserOpened] = useState(false);

  // Gate handler: after login, reviewSheetStore.pendingBusinessId is set for THIS business
  const pendingBusinessId = useReviewSheetStore((s) => s.pendingBusinessId);
  const clearPending = useReviewSheetStore((s) => s.setPending);

  const isPendingOpen = pendingBusinessId === business.id && isAuthenticated && !isOwner;
  const sheetOpen = userOpened || isPendingOpen;

  function handleCloseSheet() {
    setUserOpened(false);
    if (pendingBusinessId === business.id) {
      clearPending(null);
    }
  }

  function handleWriteReview() {
    if (!isAuthenticated) {
      const search = location.search;
      const returnToWithTab = search.includes('tab=reviews')
        ? `${location.pathname}${search}`
        : `${location.pathname}?tab=reviews`;
      loginGate.request({
        type: 'review',
        payload: { businessId: business.id },
        returnTo: returnToWithTab,
      });
      return;
    }
    setUserOpened(true);
  }

  function handleSheetSaved() {
    // Sheet closes itself; reviews list will refetch via cache invalidation
    refetch();
  }

  function handleSheetDeleted() {
    refetch();
  }

  const buttonLabel = myReview ? 'Edit your review' : 'Write a review';

  return (
    <div className="pt-6 pb-8 space-y-6">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl font-heading font-bold text-ink">
            {formatRating(business.rating, business.reviewCount)}
          </div>
          <div className="flex flex-col">
            <div className="flex text-primary" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  strokeWidth={0}
                  fill={i < Math.round(business.rating) ? 'currentColor' : 'var(--color-border)'}
                />
              ))}
            </div>
            <span className="text-sm font-body text-muted mt-1">
              {business.reviewCount} {business.reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>

        {/* Write / Edit button — hidden for the business owner */}
        {!isOwner && (
          <Button
            id="write-review-btn"
            variant="secondary"
            size="sm"
            onClick={handleWriteReview}
          >
            {buttonLabel}
          </Button>
        )}
      </div>

      <hr className="border-border" />

      {/* Review list */}
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

        {isError && <ErrorState error={error} onRetry={() => refetch()} />}

        {!isLoading && !isError && reviews?.length === 0 && (
          <EmptyState
            icon={<MessageSquare size={32} aria-hidden="true" />}
            title="No reviews yet"
            text="Be the first to share your experience!"
          />
        )}

        {!isLoading && !isError && reviews?.length > 0 && (
          <ul className="space-y-6">
            {reviews.map((rev) => (
              <li key={rev.id} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-semibold text-ink text-sm">
                    {rev.reviewerName}
                    {rev.isMine && (
                      <span className="ml-1.5 font-body text-xs text-muted font-normal">(You)</span>
                    )}
                  </span>
                  <span className="text-muted text-xs mx-1" aria-hidden="true">•</span>
                  <span className="text-muted text-xs">{formatRelativeTime(rev.createdAt)}</span>
                </div>
                <div className="flex text-primary" aria-hidden="true">
                  <span className="sr-only">{`${rev.rating} out of 5 stars`}</span>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      strokeWidth={0}
                      fill={i < rev.rating ? 'currentColor' : 'var(--color-border)'}
                    />
                  ))}
                </div>
                {rev.body && (
                  <p className="font-body text-sm text-body leading-relaxed">{rev.body}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ReviewSheet */}
      <ReviewSheet
        open={sheetOpen}
        onClose={handleCloseSheet}
        businessId={business.id}
        existing={myReview}
        onSaved={handleSheetSaved}
        onDeleted={handleSheetDeleted}
      />
    </div>
  );
}
