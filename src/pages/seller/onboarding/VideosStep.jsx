import { useRef } from 'react';
import VideosManager from '../VideosManager';
import StepFooter from './StepFooter';

/**
 * Step 6 (optional): links to public Instagram reels, each saved as soon as it is added and shown with
 * its embed. Next just moves on, unless a new link was typed and not added.
 *
 * @param {{ business: import('../../../services/contract.js').MyBusiness, onBack?: () => void, onSaved: () => void }} props
 */
export default function VideosStep({ business, onBack, onSaved }) {
  const manager = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (manager.current?.hasUnaddedLink()) {
      manager.current.flagUnaddedLink();
      return;
    }
    onSaved();
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-sm text-body">
        Optional. Add links to public Instagram reels that show your work — they appear on your shop page.
      </p>
      <VideosManager ref={manager} videos={business.videos} />
      <form onSubmit={handleSubmit} noValidate>
        <StepFooter onBack={onBack} />
      </form>
    </div>
  );
}
