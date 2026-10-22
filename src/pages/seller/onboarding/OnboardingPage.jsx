import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ErrorState from '../../../components/ui/ErrorState';
import PageHeader from '../../../components/ui/PageHeader';
import Skeleton from '../../../components/ui/Skeleton';
import { useMyBusiness } from '../../../queries/seller';
import BasicsStep from './BasicsStep';
import ContactStep from './ContactStep';
import LocationStep from './LocationStep';
import { clampStep, STEP_COUNT } from './onboardingModel';
import ProgressHeader from './ProgressHeader';
import StepComingSoon from './StepComingSoon';

const STEP_COMPONENTS = { 1: BasicsStep, 2: LocationStep, 3: ContactStep };

/**
 * /seller/onboarding — the 7-step wizard. The step lives in `?step=`, so the browser Back button and a
 * reload work; without it the wizard resumes at the first incomplete step. Each step saves on Next.
 * Steps 4–7 are built in B4.2b and show a stand-in until then.
 */
export default function OnboardingPage() {
  const { data: business, isLoading, isError, error, refetch } = useMyBusiness();
  // A failed background refetch keeps the data, so it must not throw away what the seller is typing.
  const showError = isError && business === undefined;
  const [params, setParams] = useSearchParams();
  const step = clampStep(params.get('step'), business);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // The first move from a bare URL replaces it, so browser Back doesn't land on a URL that resolves to the same step.
  function goTo(n) {
    setParams({ step: String(Math.min(Math.max(n, 1), STEP_COUNT)) }, { replace: !params.has('step') });
  }

  const StepComponent = STEP_COMPONENTS[step] ?? StepComingSoon;

  return (
    <div className="min-h-svh bg-bg">
      <PageHeader title="Set up your shop" fallbackTo="/profile" />
      <main className="flex flex-col gap-6 px-screen pt-6 pb-10">
        {isLoading && (
          <div className="flex flex-col gap-4" role="status" aria-label="Loading">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        )}
        {showError && <ErrorState error={error} onRetry={() => refetch()} />}
        {!isLoading && !showError && (
          <>
            <ProgressHeader step={step} />
            <StepComponent
              key={step}
              business={business ?? null}
              onBack={step > 1 ? () => goTo(step - 1) : undefined}
              onSaved={() => goTo(step + 1)}
            />
          </>
        )}
      </main>
    </div>
  );
}
