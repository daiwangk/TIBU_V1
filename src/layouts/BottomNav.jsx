import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';
import { useUnreadCounts } from '../queries/notifications';
import { isBottomNavHidden } from './navVisibility';

const NAV_ITEMS = [
  { to: '/',        label: 'Home',    Icon: Home   },
  { to: '/search',  label: 'Search',  Icon: Search },
  { to: '/saved',   label: 'Saved',   Icon: Heart  },
  { to: '/profile', label: 'Profile', Icon: User   },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const { data: unread } = useUnreadCounts();
  const hasEnquiryUnread = (unread?.enquiries ?? 0) > 0;

  if (isBottomNavHidden(pathname)) return null;

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-1/2 z-[1000] flex w-full max-w-[480px] -translate-x-1/2 justify-around border-t border-border bg-bg/95 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(58,22,49,0.06)] backdrop-blur-[14px]"
    >
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          aria-label={label}
          className={({ isActive }) =>
            `flex min-h-11 min-w-12 flex-col items-center justify-center gap-[3px] rounded-btn font-body text-[11px] no-underline motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isActive ? 'font-bold text-primary' : 'font-normal text-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
                {to === '/profile' && hasEnquiryUnread && (
                  <span
                    className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-error"
                    aria-label="Unread enquiries"
                  />
                )}
              </div>
              <span>{label}</span>
              {/* Active marker: a 2px plum bar under the label; transparent keeps the height stable. */}
              <span
                aria-hidden="true"
                className={`h-0.5 w-5 rounded-full ${isActive ? 'bg-primary' : 'bg-transparent'}`}
              />
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
