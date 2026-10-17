import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import Logo from '../../components/brand/Logo';
import Tagline from '../../components/brand/Tagline';
import LocationChip from '../../components/LocationChip';

/**
 * Home brand header: wordmark (tagline below) on the left; location pill + notifications bell on the right.
 */
export default function HomeHeader() {
  return (
    <header className="px-screen pt-2">
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/"
          aria-label="Tibu home"
          className="inline-flex items-center min-h-11 min-w-11 rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Logo size="md" />
        </Link>

        <div className="flex items-center gap-1">
          <LocationChip />
          {/* Bell placeholder — unread badge arrives with notifications (Week 5). */}
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="inline-flex items-center justify-center min-w-11 min-h-11 rounded-full text-primary hover:bg-lavender active:bg-lavender motion-safe:transition-colors motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Bell size={22} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <Tagline className="-mt-1" />
    </header>
  );
}
