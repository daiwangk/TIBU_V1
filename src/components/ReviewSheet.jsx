/**
 * ReviewSheet — src/components/ReviewSheet.jsx
 *
 * Bottom sheet for writing or editing a review.
 *   - 5 tappable stars with radio-group semantics (aria-labels "1 star"…"5 stars")
 *   - Textarea with live character counter (max 1000)
 *   - Save button (disabled while pending or rating not chosen)
 *   - Delete button in edit mode, with a confirm Dialog
 *   - Rating is required before Save is enabled
 *
 * Props
 *   open         – controls sheet visibility
 *   onClose      – called when the sheet should close
 *   businessId   – the business being reviewed
 *   existing     – Review|null — prefills stars/body when editing
 *   onSaved      – called with the returned Review after a successful save
 *   onDeleted    – called after a successful delete
 *
 * Reset pattern: parent mounts ReviewSheetContent only while `open` is true.
 * This resets all local state on each open without needing useEffect.
 */

import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDeleteMyReview, useSaveMyReview } from '../queries/reviews';
import Button from './ui/Button';
import Dialog from './ui/Dialog';
import Sheet from './ui/Sheet';

const MAX_BODY = 1000;

/** Star rating radio-group. */
function StarPicker({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Star rating" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          id={`review-star-${n}`}
          onClick={() => onChange(n)}
          className="p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Star
            size={34}
            strokeWidth={1.5}
            className={n <= (value ?? 0) ? 'text-coral fill-coral' : 'text-border fill-border'}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Inner content — mounted only when open, so state resets on each open.
 * @param {{
 *   businessId: string,
 *   existing: import('../services/contract.js').Review|null|undefined,
 *   onClose: () => void,
 *   onSaved?: (r: import('../services/contract.js').Review) => void,
 *   onDeleted?: () => void,
 * }} props
 */
function ReviewSheetContent({ businessId, existing, onClose, onSaved, onDeleted }) {
  const isEdit = !!existing;
  const [rating, setRating] = useState(existing?.rating ?? null);
  const [body, setBody] = useState(existing?.body ?? '');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const saveReview = useSaveMyReview();
  const deleteReview = useDeleteMyReview();
  const isBusy = saveReview.isPending || deleteReview.isPending;
  const remaining = MAX_BODY - body.length;

  function handleSave() {
    if (!rating) return;
    saveReview.mutate(
      { businessId, rating, body },
      {
        onSuccess: (review) => {
          toast.success(isEdit ? 'Review updated' : 'Review saved');
          onSaved?.(review);
          onClose();
        },
      },
    );
  }

  function handleDeleteConfirmed() {
    deleteReview.mutate(businessId, {
      onSuccess: () => {
        toast.success('Review deleted');
        setConfirmOpen(false);
        onDeleted?.();
        onClose();
      },
    });
  }

  return (
    <>
      <div className="px-5 pb-8 space-y-5">
        <h2 className="font-heading text-lg font-semibold text-ink pt-1">
          {isEdit ? 'Edit your review' : 'Write a review'}
        </h2>

        {/* Star rating */}
        <div className="space-y-1">
          <span id="review-rating-label" className="font-body text-sm text-muted">
            Rating
            <span className="text-error ml-0.5" aria-hidden="true">*</span>
          </span>
          <StarPicker value={rating} onChange={setRating} />
          {!rating && (
            <p className="font-body text-xs text-error" role="alert">
              Please select a rating
            </p>
          )}
        </div>

        {/* Body */}
        <div className="space-y-1">
          <label htmlFor="review-body" className="font-body text-sm text-muted">
            Your review
          </label>
          <textarea
            id="review-body"
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
            placeholder="Tell others about your experience…"
            rows={4}
            disabled={isBusy}
            aria-describedby="review-char-count"
            className="w-full rounded-card border border-border bg-bg px-3 py-2.5 font-body text-sm text-ink placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p
            id="review-char-count"
            className={`font-body text-xs text-right ${remaining < 50 ? 'text-error' : 'text-muted'}`}
          >
            {remaining} / {MAX_BODY}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            id="review-save-btn"
            onClick={handleSave}
            disabled={!rating || isBusy}
            loading={saveReview.isPending}
            className="w-full"
          >
            {isEdit ? 'Update review' : 'Save review'}
          </Button>

          {isEdit && (
            <Button
              id="review-delete-btn"
              variant="danger"
              onClick={() => setConfirmOpen(true)}
              disabled={isBusy}
              className="w-full"
            >
              <Trash2 size={16} aria-hidden="true" />
              Delete review
            </Button>
          )}
        </div>
      </div>

      {/* Confirm delete — outside Sheet so it isn't clipped */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete review?"
      >
        <p className="font-body text-sm text-body mb-6">
          Your review will be permanently removed. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            id="review-delete-cancel-btn"
            variant="secondary"
            className="flex-1"
            onClick={() => setConfirmOpen(false)}
            disabled={deleteReview.isPending}
          >
            Cancel
          </Button>
          <Button
            id="review-delete-confirm-btn"
            variant="danger"
            className="flex-1"
            onClick={handleDeleteConfirmed}
            loading={deleteReview.isPending}
          >
            Delete
          </Button>
        </div>
      </Dialog>
    </>
  );
}

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   businessId: string,
 *   existing: import('../services/contract.js').Review|null|undefined,
 *   onSaved?: (r: import('../services/contract.js').Review) => void,
 *   onDeleted?: () => void,
 * }} props
 */
export default function ReviewSheet({ open, onClose, businessId, existing, onSaved, onDeleted }) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      label={existing ? 'Edit your review' : 'Write a review'}
    >
      {open && (
        // key resets all local state on each open cycle
        <ReviewSheetContent
          key={`${businessId}-${existing?.id ?? 'new'}-${open}`}
          businessId={businessId}
          existing={existing}
          onClose={onClose}
          onSaved={onSaved}
          onDeleted={onDeleted}
        />
      )}
    </Sheet>
  );
}
