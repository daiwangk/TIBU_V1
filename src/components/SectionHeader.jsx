import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Section heading (plum) with an optional leading icon, subtitle and "See all" link.
 *
 * @param {{
 *   title: string,
 *   viewAllTo?: string,
 *   viewAllLabel?: string,
 *   icon?: React.ReactNode,
 *   subtitle?: string,
 *   className?: string,
 * }} props
 */
export default function SectionHeader({
  title,
  viewAllTo,
  viewAllLabel = 'See all',
  icon,
  subtitle,
  className = '',
}) {
  return (
    <div className={`flex items-center justify-between gap-2 px-screen ${className}`}>
      <div className="flex min-w-0 items-center gap-2">
        {icon && (
          <span className="flex flex-shrink-0 text-primary" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="flex min-w-0 flex-col">
          <h2 className="font-heading font-extrabold text-primary text-lg leading-tight">{title}</h2>
          {subtitle && <p className="font-body text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="inline-flex flex-shrink-0 items-center gap-0.5 min-h-11 px-2 -mr-2 text-sm font-body font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-btn"
        >
          {viewAllLabel}
          <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
