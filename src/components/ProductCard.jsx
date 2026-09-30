import { Link } from 'react-router-dom';
import Price from './Price';
import Distance from './Distance';
import ImagePlaceholder from './ui/ImagePlaceholder';
import Badge from './ui/Badge';
import { formatPrice } from '../lib/format';

/**
 * Product card.
 *
 * @param {{
 *   product: import('../services/contract').ProductSummary,
 *   variant?: 'row' | 'grid',
 *   action?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function ProductCard({ product, variant = 'grid', action, className = '' }) {
  const {
    id,
    name,
    price,
    imageUrl,
    businessName,
    distanceM,
    availableToday,
  } = product;

  const isRow = variant === 'row';

  return (
    <Link
      to={`/p/${id}`}
      className={`
        relative flex flex-col bg-surface rounded-card border border-border
        overflow-hidden no-underline text-inherit
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        transition-shadow hover:shadow-sm
        snap-start flex-shrink-0
        ${isRow ? 'w-40' : 'w-full'}
        ${className}
      `}
      aria-label={`${name}, ${formatPrice(price)}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImagePlaceholder aspect="1/1" bg="lavender" className="w-full h-full" />
        )}

        {/* Today badge */}
        {availableToday && (
          <span className="absolute top-2 left-2">
            <Badge tone="success">Today</Badge>
          </span>
        )}

        {/* Action slot (e.g. SaveButton) */}
        {action && (
          <span
            className="absolute top-1 right-1"
            onClick={(e) => e.preventDefault()}
          >
            {action}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1 p-2">
        <p className="font-body text-sm font-semibold text-ink line-clamp-2 leading-snug">
          {name}
        </p>
        <Price value={price} size="sm" />
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-body text-xs text-muted truncate">{businessName}</span>
          {distanceM != null && (
            <>
              <span className="text-muted text-xs">·</span>
              <Distance distanceM={distanceM} />
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
