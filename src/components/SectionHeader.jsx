import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Section heading with optional "View all" link.
 *
 * @param {{
 *   title: string,
 *   viewAllTo?: string,
 *   viewAllLabel?: string,
 *   className?: string,
 * }} props
 */
export default function SectionHeader({
  title,
  viewAllTo,
  viewAllLabel = 'View all',
  className = '',
}) {
  return (
    <div className={`flex items-center justify-between px-screen ${className}`}>
      <h2 className="font-heading font-bold text-ink text-base leading-tight">{title}</h2>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="inline-flex items-center gap-0.5 text-sm font-body font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          {viewAllLabel}
          <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
