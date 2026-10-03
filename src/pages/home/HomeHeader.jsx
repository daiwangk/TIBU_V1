import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import Logo from '../../components/brand/Logo';

/**
 * Home brand header: logo on the left; location slot + notifications bell on the right.
 */
export default function HomeHeader() {
  return (
    <header className="flex items-center justify-between gap-2 px-screen pt-2">
      <Link
        to="/"
        aria-label="Tibu home"
        className="inline-flex items-center min-h-11 rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Logo className="h-8" />
      </Link>

      <div className="flex items-center gap-1">
        {/* TODO(B2.6): render <LocationChip /> here once src/components/LocationChip.jsx exists. */}
        {/* Bell placeholder — unread badge arrives with notifications (Week 5). */}
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="inline-flex items-center justify-center min-w-11 min-h-11 rounded-full text-ink hover:bg-lavender active:bg-lavender motion-safe:transition-colors motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Bell size={22} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
