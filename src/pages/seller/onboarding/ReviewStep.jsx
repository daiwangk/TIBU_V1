import { useState } from 'react';
import Button from '../../../components/ui/Button';
import ErrorState from '../../../components/ui/ErrorState';
import Skeleton from '../../../components/ui/Skeleton';
import { shouldToast, userMessage } from '../../../lib/errors';
import { useSubmitChecklist, useSubmitForReview } from '../../../queries/seller';
import FormAlert from '../../auth/FormAlert';
import { missingFromError } from './onboardingModel';
import RejectionReason from './RejectionReason';

/**
 * Step 7: what is still missing (each item links back to its step), then "Submit for review". If the
 * server still finds something missing, those items are shown instead. A shop that is already
 * submitted (editing while pending or live) just confirms the changes are saved.
 *
 * @param {{
 *   business: import('../../../services/contract.js').MyBusiness,
 *   onBack?: () => void,
 *   onGoTo: (step: number) => void,
 *   onSubmitted: () => void,
 * }} props `onSubmitted` also takes a submitted shop back to its status screen
 */
export default function ReviewStep({ business, onBack, onGoTo, onSubmitted }) {
  const checklist = useSubmitChecklist();
  const submit = useSubmitForReview();
  const [failure, setFailure] = useState(null);
  const [serverMissing, setServerMissing] = useState(null);
  const canSubmit = business.status === 'draft' || business.status === 'rejected';

  if (!canSubmit) {
    return (
      <div className="flex flex-col gap-5">
        <FormAlert tone="success">Your changes are saved. Customers see them once your shop is live.</FormAlert>
        <div className="flex gap-3">
          {onBack && <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onBack}>Back</Button>}
          <Button type="button" size="lg" className="flex-[2]" onClick={onSubmitted}>Done</Button>
        </div>
      </div>
    );
  }

  if (checklist.isError) return <ErrorState error={checklist.error} onRetry={() => checklist.refetch()} />;
  if (!checklist.data) {
    return (
      <div className="flex flex-col gap-3" role="status" aria-label="Loading">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  const missing = serverMissing ?? checklist.data.missing;
  const ready = missing.length === 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setFailure(null);
    setServerMissing(null);
    try {
      await submit.mutateAsync();
      onSubmitted();
    } catch (err) {
      const fromServer = missingFromError(err);
      if (fromServer) setServerMissing(fromServer);
      // Network / unknown errors already raise the global toast; show the rest here.
      else if (!shouldToast(err)) setFailure(err);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {business.status === 'rejected' && <RejectionReason reason={business.rejectionReason} />}
      {failure && <FormAlert>{userMessage(failure)}</FormAlert>}

      {ready ? (
        <FormAlert tone="success">
          Everything is ready. Tibu checks every shop before it goes live, and you&apos;ll get a notification when yours is reviewed.
        </FormAlert>
      ) : (
        <section aria-labelledby="still-to-do" className="flex flex-col gap-3">
          <h3 id="still-to-do" className="font-heading text-lg font-bold text-ink">Still to do</h3>
          <ul className="flex flex-col gap-2">
            {missing.map((item) => (
              <li key={item.key} className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-3">
                <span className="font-body text-sm text-ink">{item.label}</span>
                <Button type="button" variant="secondary" onClick={() => onGoTo(item.step)} aria-label={`${item.label}: go to step ${item.step}`}>
                  Go to step {item.step}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex gap-3">
        {onBack && <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onBack} disabled={submit.isPending}>Back</Button>}
        <Button type="submit" size="lg" className="flex-[2]" disabled={!ready} loading={submit.isPending}>
          {business.status === 'rejected' ? 'Resubmit for review' : 'Submit for review'}
        </Button>
      </div>
    </form>
  );
}
