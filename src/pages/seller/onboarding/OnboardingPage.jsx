import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ErrorState from '../../../components/ui/ErrorState';
import PageHeader from '../../../components/ui/PageHeader';
import Skeleton from '../../../components/ui/Skeleton';
import { useMyBusiness } from '../../../queries/seller';
import BasicsStep from './BasicsStep';
import BrandingStep from './BrandingStep';
import ContactStep from './ContactStep';
import LocationStep from './LocationStep';
import { clampStep, STEP_COUNT } from './onboardingModel';
import ProductsStep from './ProductsStep';
import ProgressHeader from './ProgressHeader';
import ReviewStep from './ReviewStep';
import StatusScreen from './StatusScreen';
import VideosStep from './VideosStep';

/** A search-params updater that changes `step` and keeps the other params (`edit`). */
function withStep(n) {
  return (current) => {
    const next = new URLSearchParams(current);
    next.set('step', String(n));
    return next;
  };
}

const STEP_COMPONENTS = { 1: BasicsStep, 2: LocationStep, 3: ContactStep, 4: BrandingStep, 5: ProductsStep, 6: VideosStep, 7: ReviewStep };

/**
 * /seller/onboarding — the 7-step wizard. The step lives in `?step=`, so the browser Back button and a
 * reload work; without it the wizard resumes at the first incomplete step. Each step saves on Next.
 * Once the shop is submitted (pending, rejected, approved, unpublished) the page shows its status
 * instead; "Edit details" / "Fix and resubmit" open the wizard again with `?edit=1`.
 */
export default function OnboardingPage() {
  const { data: business, isLoading, isError, error, refetch } = useMyBusiness();
  // A failed background refetch keeps the data, so it must not throw away what the seller is typing.
  const showError = isError && business === undefined;
  const [params, setParams] = useSearchParams();
  const step = clampStep(params.get('step'), business);
  const showStatus = Boolean(business) && business.status !== 'draft' && params.get('edit') !== '1';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, showStatus]);

  // Write the resolved step into the URL as soon as the business is known (replacing a bare, junk or
  // out-of-range one). Otherwise the step would keep following the saved data, and finishing a step's
  // work (an upload, a product) would move the seller on by itself. Browser Back then also lands on the
  // previous step rather than on a bare URL that resolves to the current one.
  const stepParam = params.get('step');
  useEffect(() => {
    if (business !== undefined && !showStatus && stepParam !== String(step)) setParams(withStep(step), { replace: true });
  }, [business, showStatus, stepParam, step, setParams]);

  function goTo(n) {
    setParams(withStep(Math.min(Math.max(n, 1), STEP_COUNT)));
  }

  const StepComponent = STEP_COMPONENTS[step] ?? BasicsStep;

  return (
    <div className="min-h-svh bg-bg">
      <PageHeader title={showStatus ? 'Your shop' : 'Set up your shop'} fallbackTo="/profile" />
      <main className="flex flex-col gap-6 px-screen pt-6 pb-10">
        {isLoading && (
          <div className="flex flex-col gap-4" role="status" aria-label="Loading">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        )}
        {showError && <ErrorState error={error} onRetry={() => refetch()} />}
        {!isLoading && !showError && showStatus && (
          <StatusScreen business={business} onEdit={() => setParams({ edit: '1', step: '1' })} />
        )}
        {!isLoading && !showError && !showStatus && (
          <>
            <ProgressHeader step={step} />
            <StepComponent
              key={step}
              business={business ?? null}
              onBack={step > 1 ? () => goTo(step - 1) : undefined}
              onSaved={() => goTo(step + 1)}
              onGoTo={goTo}
              onSubmitted={() => setParams({})}
            />
          </>
        )}
      </main>
    </div>
  );
}
