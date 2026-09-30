import { Star } from 'lucide-react';
import { formatRating } from '../lib/format';

/**
 * Star rating display.
 *
 * @param {{
 *   rating: number,
 *   reviewCount?: number,
 *   className?: string,
 * }} props
 */
export default function Rating({ rating, reviewCount, className = '' }) {
  const label = formatRating(rating, reviewCount);

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Star
        size={14}
        strokeWidth={0}
        fill="currentColor"
        aria-hidden="true"
        className="text-primary"
      />
      <span className="font-body text-sm font-semibold text-ink">{label}</span>
      {reviewCount != null && reviewCount > 0 && (
        <span className="font-body text-xs text-muted">({reviewCount})</span>
      )}
    </span>
  );
}
