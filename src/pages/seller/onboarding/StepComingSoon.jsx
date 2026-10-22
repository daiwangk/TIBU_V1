import { Hammer } from 'lucide-react';
import EmptyState from '../../../components/ui/EmptyState';
import StepFooter from './StepFooter';

/**
 * Stand-in for steps 4–7, which B4.2b builds. Only Back works.
 *
 * @param {{ onBack: () => void }} props
 */
export default function StepComingSoon({ onBack }) {
  return (
    <div className="flex flex-col gap-4">
      <EmptyState
        icon={<Hammer size={28} aria-hidden="true" />}
        title="This step is coming soon"
        text="Your details so far are saved. Branding, products, videos and submitting for review are next."
      />
      <StepFooter onBack={onBack} showNext={false} />
    </div>
  );
}
