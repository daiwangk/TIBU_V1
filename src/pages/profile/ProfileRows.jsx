import { Bell, ChevronRight, CircleHelp, FileText, Heart, History, Info, Lock, MessageCircle, ShieldCheck, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const ICONS = {
  enquiries: MessageCircle,
  saved: Heart,
  recent: History,
  connected: MessageCircle,
  notifications: Bell,
  sell: Store,
  seller: Store,
  admin: ShieldCheck,
  help: CircleHelp,
  about: Info,
  privacy: Lock,
  terms: FileText,
};

/**
 * A titled group of navigation rows.
 *
 * @param {{ title: string, rows: Array<{ key: string, label: string, to: string }> }} props
 */
export default function ProfileRows({ title, rows }) {
  const headingId = `rows-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-2 px-1 font-body text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h2>
      <ul className="overflow-hidden rounded-card border border-border bg-surface">
        {rows.map(({ key, label, to }) => {
          const Icon = ICONS[key] ?? ChevronRight;
          return (
            <li key={key} className="border-b border-border last:border-b-0">
              <Link
                to={to}
                className="flex min-h-12 items-center gap-3 px-4 py-3 font-body text-sm text-ink hover:bg-lavender/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              >
                <Icon size={20} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                <ChevronRight size={18} className="text-muted" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
