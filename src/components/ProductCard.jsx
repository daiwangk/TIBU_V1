import { Link } from 'react-router-dom';
import Price from './Price';
import Distance from './Distance';
import ImagePlaceholder from './ui/ImagePlaceholder';
import Badge from './ui/Badge';

/**
 * Product card.
 *
 * @param {{
 *   product: import('../services/contract').ProductSummary,
 *   variant?: 'row' | 'grid',
 *   action?: React.ReactNode,
 *   className?: string,
 * }} props
 * `action` (e.g. SaveButton) sits over the image corner, next to the link rather than inside it.
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

  const size = `snap-start flex-shrink-0 ${isRow ? 'w-40' : 'w-full'}`;
  const card = (
    <Link
      to={`/p/${id}`}
      className={`
        relative flex flex-col bg-surface rounded-card border border-border
        overflow-hidden no-underline text-inherit
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        transition-shadow hover:shadow-sm
        ${action ? 'h-full w-full' : `${size} ${className}`}
      `}
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

        {/* Available-today pill on the image (bottom-left; the save action owns the top-right corner) */}
        {availableToday && (
          <span className="absolute bottom-2 left-2">
            <Badge tone="success">Available today</Badge>
          </span>
        )}
      </div>

      {/* Body: name in ink, price as the stronger plum element */}
      <div className="flex flex-col gap-1 p-2.5">
        <p className="font-body text-sm font-semibold text-ink line-clamp-2 leading-snug">
          {name}
        </p>
        <Price value={price} size="md" />
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

  if (!action) return card;
  return (
    <div className={`relative ${size} ${className}`}>
      {card}
      <span className="absolute top-1 right-1">{action}</span>
    </div>
  );
}
