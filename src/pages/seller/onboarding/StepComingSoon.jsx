import { Hammer } from 'lucide-react';
import EmptyState from '../../../components/ui/EmptyState';
import StepFooter from './StepFooter';

/**
 * Stand-in for steps 6–7, which the next onboarding task builds. Only Back works.
 *
 * @param {{ onBack: () => void }} props
 */
export default function StepComingSoon({ onBack }) {
  return (
    <div className="flex flex-col gap-4">
      <EmptyState
        icon={<Hammer size={28} aria-hidden="true" />}
        title="This step is coming soon"
        text="Your details so far are saved. Videos and submitting for review are next."
      />
      <StepFooter onBack={onBack} showNext={false} />
    </div>
  );
}
