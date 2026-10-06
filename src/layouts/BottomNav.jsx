import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';
import { isBottomNavHidden } from './navVisibility';

const NAV_ITEMS = [
  { to: '/',        label: 'Home',    Icon: Home   },
  { to: '/search',  label: 'Search',  Icon: Search },
  { to: '/saved',   label: 'Saved',   Icon: Heart  },
  { to: '/profile', label: 'Profile', Icon: User   },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  if (isBottomNavHidden(pathname)) return null;

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-1/2 z-[1000] flex w-full max-w-[480px] -translate-x-1/2 justify-around border-t border-border bg-surface/95 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[14px]"
    >
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          aria-label={label}
          className={({ isActive }) =>
            `flex min-h-11 min-w-12 flex-col items-center justify-center gap-[3px] font-body text-[11px] no-underline motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isActive ? 'font-semibold text-primary' : 'font-normal text-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-8 w-10 items-center justify-center rounded-xl motion-safe:transition-colors motion-safe:duration-200 ${
                  isActive ? 'bg-lavender' : 'bg-transparent'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} aria-hidden="true" />
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
