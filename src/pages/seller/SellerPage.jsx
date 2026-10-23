import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { useMyBusiness } from '../../queries/seller';

/**
 * Frame for every seller screen after onboarding: a header with a way back, and the shop's data with
 * loading and error states handled once. `children` is a function that receives the loaded business
 * (SellerGate has already sent drafts to onboarding, so it is never a draft here). A failed background
 * refetch keeps showing the data.
 *
 * @param {{
 *   title: string,
 *   backTo?: string,
 *   children: (business: import('../../services/contract.js').MyBusiness) => React.ReactNode,
 * }} props
 */
export default function SellerPage({ title, backTo = '/seller', children }) {
  const { data: business, isLoading, isError, error, refetch } = useMyBusiness();

  return (
    <div className="min-h-svh bg-bg">
      <PageHeader title={title} fallbackTo={backTo} />
      <main className="flex flex-col gap-6 px-screen pt-6 pb-10">
        {isLoading && (
          <div className="flex flex-col gap-4" role="status" aria-label="Loading">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}
        {isError && business === undefined && <ErrorState error={error} onRetry={() => refetch()} />}
        {business && children(business)}
      </main>
    </div>
  );
}
