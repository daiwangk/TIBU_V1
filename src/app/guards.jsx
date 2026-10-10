import { ShieldOff } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Spinner from '../components/ui/Spinner';
import { loginRedirectPath, roleAllowed } from '../lib/authGuard';
import { useMe } from '../queries/me';
import { useAuthStore } from '../stores/auth';

function CentredSpinner() {
  return (
    <div className="flex h-screen items-center justify-center" role="status" aria-label="Loading">
      <Spinner size={32} />
    </div>
  );
}

/**
 * Signed-in users only. While the session is being restored it shows a spinner (never a redirect);
 * a guest is sent to /login?next=<where they were going>.
 *
 * @param {{ children?: React.ReactNode }} props renders `children`, or the nested route via <Outlet />
 */
export function RequireAuth({ children }) {
  const status = useAuthStore((s) => s.status);
  const { pathname, search } = useLocation();

  if (status === 'loading') return <CentredSpinner />;
  if (status === 'guest') return <Navigate to={loginRedirectPath(pathname, search)} replace />;
  return children ?? <Outlet />;
}

function RoleCheck({ roles, children }) {
  const { data: profile, isLoading, isError, error, refetch } = useMe();

  if (isLoading) return <CentredSpinner />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!profile) return <CentredSpinner />;

  if (!roleAllowed(profile.role, roles)) {
    return (
      <div className="min-h-screen bg-bg">
        <EmptyState
          icon={<ShieldOff size={32} aria-hidden="true" />}
          title="This page isn't for your account"
          text="You don't have access to this area."
        />
        <div className="flex justify-center">
          <Button to="/">Back to Home</Button>
        </div>
      </div>
    );
  }
  return children ?? <Outlet />;
}

/**
 * Signed-in users with one of `roles` ('admin' passes any check). The role comes from the profile, so
 * it shows a spinner while that loads — never the 403 screen first.
 *
 * @param {{ roles: Array<'customer'|'seller'|'admin'>, children?: React.ReactNode }} props
 */
export function RequireRole({ roles, children }) {
  return (
    <RequireAuth>
      <RoleCheck roles={roles}>{children}</RoleCheck>
    </RequireAuth>
  );
}
