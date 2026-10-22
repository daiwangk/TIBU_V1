import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RequireRole } from '../../app/guards';
import ErrorState from '../../components/ui/ErrorState';
import Spinner from '../../components/ui/Spinner';
import { sellerGateRedirect } from '../../lib/sellerGate';
import { useMyBusiness } from '../../queries/seller';

function BusinessCheck() {
  const { pathname } = useLocation();
  const { data: business, isLoading, isError, error, refetch } = useMyBusiness();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center" role="status" aria-label="Loading">
        <Spinner size={32} />
      </div>
    );
  }
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;

  const redirectTo = sellerGateRedirect(business, pathname);
  if (redirectTo) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}

/**
 * Layout route for everything under /seller: signed-in sellers only, and a seller who has not yet
 * submitted a shop (no business, or a draft) is sent to /seller/onboarding.
 */
export default function SellerGate() {
  return (
    <RequireRole roles={['seller']}>
      <BusinessCheck />
    </RequireRole>
  );
}
