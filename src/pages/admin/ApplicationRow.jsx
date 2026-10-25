import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../../lib/format';

/**
 * One application in the admin list; tapping opens its detail.
 *
 * @param {{ row: import('../../services/contract.js').ApplicationRow }} props
 */
export default function ApplicationRow({ row }) {
  const meta = [row.categoryName, row.locality].filter(Boolean).join(' · ');
  return (
    <li className="border-b border-border last:border-b-0">
      <Link
        to={`/admin/applications/${row.businessId}`}
        className="flex min-h-12 items-center gap-3 px-4 py-3 hover:bg-lavender/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-body text-sm font-semibold text-ink">{row.name}</span>
          {meta && <span className="truncate font-body text-xs text-body">{meta}</span>}
          <span className="truncate font-body text-xs text-muted">
            {row.ownerName ?? 'Unknown owner'} · {row.submittedAt ? `Submitted ${formatRelativeTime(row.submittedAt)}` : 'Not submitted'}
          </span>
        </div>
        <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
      </Link>
    </li>
  );
}
