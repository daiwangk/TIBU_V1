import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';

/**
 * One row in Recently viewed / Previously connected: picture, title, detail line, time line → item.
 *
 * @param {{
 *   to: string,
 *   imageUrl: string|null,
 *   title: string,
 *   detail?: React.ReactNode,
 *   meta?: string|null,
 *   round?: boolean,   // logos are round, product photos square
 * }} props
 */
export default function ActivityRow({ to, imageUrl, title, detail, meta, round = false }) {
  const shape = round ? 'rounded-full' : 'rounded-card';
  return (
    <li>
      <Link
        to={to}
        className="flex min-h-16 items-center gap-3 rounded-card border border-border bg-surface p-3 no-underline text-inherit hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className={`h-14 w-14 flex-shrink-0 overflow-hidden ${shape}`}>
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlaceholder aspect="1/1" bg={round ? 'mint' : 'lavender'} iconSize={20} className="h-full w-full" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-bold text-ink">{title}</p>
          {detail && <div className="truncate font-body text-xs text-body">{detail}</div>}
          {meta && <p className="font-body text-xs text-muted">{meta}</p>}
        </div>
        <ChevronRight size={18} className="flex-shrink-0 text-body" aria-hidden="true" />
      </Link>
    </li>
  );
}

