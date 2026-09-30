import { MapPin } from 'lucide-react';
import { formatDistance } from '../lib/format';

/**
 * Distance display — renders nothing when distanceM is null/undefined.
 *
 * @param {{
 *   distanceM: number | null | undefined,
 *   className?: string,
 * }} props
 */
export default function Distance({ distanceM, className = '' }) {
  if (distanceM == null) return null;

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      <MapPin size={12} strokeWidth={1.75} aria-hidden="true" className="text-muted flex-shrink-0" />
      <span className="font-body text-xs text-muted">{formatDistance(distanceM)}</span>
    </span>
  );
}
