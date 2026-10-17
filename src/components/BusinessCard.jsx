import { Link } from 'react-router-dom';
import Rating from './Rating';
import Distance from './Distance';
import ImagePlaceholder from './ui/ImagePlaceholder';

/**
 * Business card.
 *
 * @param {{
 *   business: import('../services/contract').BusinessSummary,
 *   action?: React.ReactNode,
 *   className?: string,
 * }} props
 * `action` (e.g. SaveButton) sits next to the link, not inside it, so it is never a button nested in a link.
 */
export default function BusinessCard({ business, action, className = '' }) {
  const {
    slug,
    name,
    categoryName,
    logoUrl,
    locality,
    distanceM,
    rating,
    reviewCount,
  } = business;

  const card = (
    <Link
      to={`/b/${slug}`}
      className={`
        flex items-center gap-3 bg-surface rounded-card border border-border p-3
        no-underline text-inherit
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        transition-shadow hover:shadow-sm
        ${action ? 'pr-12' : className}
      `}
    >
      {/* Logo */}
      <div className="w-14 h-14 rounded-card overflow-hidden flex-shrink-0">
        {logoUrl ? (
          <img src={logoUrl} alt={`${name} logo`} className="w-full h-full object-cover" />
        ) : (
          <ImagePlaceholder aspect="1/1" bg="mint" iconSize={20} className="w-full h-full" />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <p className="font-heading font-bold text-ink text-sm leading-tight truncate">{name}</p>
        <p className="font-body text-xs text-muted truncate">{categoryName}</p>
        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
          <span className="font-body text-xs text-muted">{locality}</span>
          {distanceM != null && (
            <>
              <span className="text-muted text-xs">·</span>
              <Distance distanceM={distanceM} />
            </>
          )}
        </div>
        <Rating rating={rating} reviewCount={reviewCount} className="mt-0.5" />
      </div>
    </Link>
  );

  if (!action) return card;
  return (
    <div className={`relative ${className}`}>
      {card}
      <span className="absolute top-1 right-1">{action}</span>
    </div>
  );
}
