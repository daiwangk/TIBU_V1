import { STEPS, STEP_COUNT } from './onboardingModel';

/**
 * "Step 3 of 7", the step's title and a segmented progress bar.
 *
 * @param {{ step: number }} props 1–7
 */
export default function ProgressHeader({ step }) {
  const current = STEPS.find((s) => s.n === step) ?? STEPS[0];
  return (
    <div>
      <p className="font-body text-sm font-semibold text-muted">
        Step {current.n} of {STEP_COUNT}
      </p>
      <h2 className="mt-0.5 font-heading text-2xl font-bold text-ink">{current.title}</h2>
      <ol className="mt-3 flex gap-1.5" aria-hidden="true">
        {STEPS.map((s) => (
          <li key={s.n} className={`h-1.5 flex-1 rounded-full ${s.n <= current.n ? 'bg-primary' : 'bg-border'}`} />
        ))}
      </ol>
    </div>
  );
}
