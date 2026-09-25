import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',        label: 'Home',    Icon: Home   },
  { to: '/search',  label: 'Search',  Icon: Search },
  { to: '/saved',   label: 'Saved',   Icon: Heart  },
  { to: '/profile', label: 'Profile', Icon: User   },
];

/**
 * Route prefixes that should suppress the BottomNav.
 * Matches from the start of the pathname.
 */
const HIDDEN_PREFIXES = [
  '/product/',
  '/business/',
  '/reel/',
  '/seller/',
  '/viewall/',
];

export default function BottomNav() {
  const { pathname } = useLocation();

  const isHidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isHidden) return null;

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: '1px solid var(--color-border)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
        zIndex: 1000,
      }}
    >
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          aria-label={label}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            textDecoration: 'none',
            color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
            fontFamily: 'var(--font-body)',
            fontWeight: isActive ? 600 : 400,
            fontSize: '11px',
            minWidth: '48px',
            minHeight: '44px',
            transition: 'color 0.2s',
          })}
        >
          {({ isActive }) => (
            <>
              <span
                style={{
                  background: isActive ? 'var(--color-lavender)' : 'transparent',
                  borderRadius: '12px',
                  width: '40px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  aria-hidden="true"
                />
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
