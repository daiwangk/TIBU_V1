import Button from '../../../components/ui/Button';

/**
 * Back / Next row at the end of a step's form. Next submits the form (the step validates and saves).
 *
 * @param {{ onBack?: () => void, loading?: boolean, showNext?: boolean, nextLabel?: string }} props
 */
export default function StepFooter({ onBack, loading = false, showNext = true, nextLabel = 'Next' }) {
  return (
    <div className="mt-2 flex gap-3">
      {onBack && (
        <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onBack} disabled={loading}>
          Back
        </Button>
      )}
      {showNext && (
        <Button type="submit" size="lg" className="flex-[2]" loading={loading}>
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
