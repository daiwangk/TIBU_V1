import { formatRelativeTime } from '../../lib/format';
import AdminSection from './AdminSection';
import { formatDate, HISTORY_LABELS } from './adminModel';

/**
 * Every admin decision on this business, oldest first.
 *
 * @param {{ history: import('../../services/contract.js').ApplicationDetail['history'] }} props
 */
export default function ApplicationHistory({ history }) {
  return (
    <AdminSection id="history" title="History">
      {history.length === 0 ? (
        <p className="font-body text-sm text-muted">No admin decisions yet</p>
      ) : (
        <ol className="overflow-hidden rounded-card border border-border bg-surface">
          {history.map((entry, i) => (
            <li key={`${entry.createdAt}-${i}`} className="flex flex-col gap-0.5 border-b border-border px-4 py-3 last:border-b-0">
              <span className="font-body text-sm font-semibold text-ink">
                {HISTORY_LABELS[entry.action] ?? entry.action} by {entry.adminName ?? 'an admin'}
              </span>
              {entry.reason && <span className="whitespace-pre-line font-body text-sm text-body">{entry.reason}</span>}
              <time dateTime={entry.createdAt} className="font-body text-xs text-muted">
                {formatDate(entry.createdAt)} · {formatRelativeTime(entry.createdAt)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </AdminSection>
  );
}
