import { formatRelativeTime } from '../../lib/format';
import { getNotificationIcon } from './notificationsModel';

/**
 * Single interactive notification card.
 *
 * @param {{
 *   item: import('../../services/contract').Notification,
 *   onTap: (item: import('../../services/contract').Notification) => void,
 * }} props
 */
export default function NotificationRow({ item, onTap }) {
  const { Icon, bg } = getNotificationIcon(item.type);
  const isUnread = !item.readAt;

  return (
    <button
      type="button"
      onClick={() => onTap(item)}
      className={`flex w-full min-h-12 items-start gap-3 rounded-card border text-left p-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isUnread
          ? 'border-primary/20 bg-lavender/40 hover:bg-lavender/60'
          : 'border-border bg-surface hover:bg-surface/80'
      }`}
    >
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${bg}`}>
        <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-heading text-sm font-semibold text-ink line-clamp-1">{item.title}</p>
          <span className="flex-shrink-0 font-body text-xs text-muted">
            {formatRelativeTime(item.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 font-body text-xs text-body line-clamp-2">{item.body}</p>
      </div>

      {isUnread && (
        <span
          className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary"
          aria-label="Unread notification"
        />
      )}
    </button>
  );
}
