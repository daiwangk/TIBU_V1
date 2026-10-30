import {
  Bell,
  MessageSquare,
  Reply,
  CheckCircle,
  XCircle,
  EyeOff,
  Star,
  Sparkles,
} from 'lucide-react';

/**
 * Maps CONTRACT §6 notification type to an icon and pastel circle tint.
 *
 * @param {string} type
 * @returns {{ Icon: React.ComponentType, bg: string }}
 */
export function getNotificationIcon(type) {
  switch (type) {
    case 'enquiry_new':
      return { Icon: MessageSquare, bg: 'bg-lavender text-primary' };
    case 'enquiry_reply':
      return { Icon: Reply, bg: 'bg-lavender text-primary' };
    case 'business_approved':
      return { Icon: CheckCircle, bg: 'bg-mint text-primary' };
    case 'business_rejected':
      return { Icon: XCircle, bg: 'bg-blush text-primary' };
    case 'business_unpublished':
      return { Icon: EyeOff, bg: 'bg-blush text-primary' };
    case 'review_new':
      return { Icon: Star, bg: 'bg-lime text-primary' };
    case 'digest_new_businesses':
      return { Icon: Sparkles, bg: 'bg-lavender text-primary' };
    default:
      return { Icon: Bell, bg: 'bg-lavender text-primary' };
  }
}

/**
 * Checks if an ISO date string corresponds to today's local date.
 *
 * @param {string} iso
 * @param {Date} [now]
 * @returns {boolean}
 */
export function isToday(iso, now = new Date()) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Groups an array of notifications into "Today" and "Earlier".
 *
 * @param {import('../../services/contract').Notification[]} items
 * @param {Date} [now]
 * @returns {{ today: import('../../services/contract').Notification[], earlier: import('../../services/contract').Notification[] }}
 */
export function groupNotificationsByDay(items = [], now = new Date()) {
  const today = [];
  const earlier = [];

  for (const item of items) {
    if (isToday(item.createdAt, now)) {
      today.push(item);
    } else {
      earlier.push(item);
    }
  }

  return { today, earlier };
}

/**
 * Formats notification badge count: null when 0, "9+" when > 9.
 *
 * @param {number|null|undefined} count
 * @returns {string|null}
 */
export function formatBadgeCount(count) {
  const n = Number(count) || 0;
  if (n <= 0) return null;
  if (n > 9) return '9+';
  return String(n);
}

