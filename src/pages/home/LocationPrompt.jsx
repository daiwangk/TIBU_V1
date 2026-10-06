import { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import AreaPickerSheet from '../../components/AreaPickerSheet';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import { useLocationStore } from '../../stores/location';
import { userMessage } from '../../lib/errors';

/**
 * First-visit prompt under the hero. Never asks the browser for permission by itself —
 * only when the user taps "Use my location". Shown until the user has used or dismissed it.
 * If GPS fails, the area picker opens with the reason so the user can pick an area instead.
 */
export default function LocationPrompt() {
  const asked = useLocationStore((s) => s.asked);
  const hasLocation = useLocationStore((s) => s.lat != null);
  const requestGps = useLocationStore((s) => s.requestGps);
  const markAsked = useLocationStore((s) => s.markAsked);

  const [locating, setLocating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [notice, setNotice] = useState('');

  async function handleGps() {
    setLocating(true);
    try {
      await requestGps();
    } catch (e) {
      markAsked();
      setNotice(userMessage(e));
      setPickerOpen(true);
    } finally {
      setLocating(false);
    }
  }

  function handleChooseArea() {
    markAsked();
    setNotice('');
    setPickerOpen(true);
  }

  const showCard = !asked && !hasLocation;

  return (
    <>
      {showCard && (
        <section
          aria-label="Find businesses near you"
          className="relative mx-screen flex flex-col gap-3 rounded-card border border-border bg-surface p-4"
        >
          <IconButton label="Dismiss" onClick={markAsked} className="absolute right-1 top-1">
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </IconButton>
          <div className="flex items-start gap-3 pr-10">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-lavender text-primary">
              <MapPin size={20} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5">
              <h2 className="font-heading text-base font-bold text-ink">See what&apos;s near you</h2>
              <p className="font-body text-sm text-body">Find homegrown sellers close to you.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" loading={locating} onClick={handleGps}>
              Use my location
            </Button>
            <Button size="sm" variant="secondary" onClick={handleChooseArea}>
              Choose area
            </Button>
          </div>
        </section>
      )}
      <AreaPickerSheet open={pickerOpen} onClose={() => setPickerOpen(false)} notice={notice} />
    </>
  );
}
