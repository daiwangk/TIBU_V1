import { Link } from 'react-router-dom';
import Rating from './Rating';
import Distance from './Distance';
import ImagePlaceholder from './ui/ImagePlaceholder';

/**
 * Business card.
 *
 * @param {{
 *   business: import('../services/contract').BusinessSummary,
 *   className?: string,
 * }} props
 */
export default function BusinessCard({ business, className = '' }) {
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

  return (
    <Link
      to={`/b/${slug}`}
      className={`
        flex items-center gap-3 bg-surface rounded-card border border-border p-3
        no-underline text-inherit
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        transition-shadow hover:shadow-sm
        ${className}
      `}
      aria-label={name}
    >
      {/* Logo */}
      <div className="w-14 h-14 rounded-card overflow-hidden flex-shrink-0">
        {logoUrl ? (
          <img src={logoUrl} alt={`${name} logo`} className="w-full h-full object-cover" />
        ) : (
          <ImagePlaceholder aspectRatio="1/1" bg="mint" iconSize={20} className="w-full h-full" />
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
}
