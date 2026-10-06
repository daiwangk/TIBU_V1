import { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import AreaPickerSheet from './AreaPickerSheet';
import { useLocationStore } from '../stores/location';

/**
 * Header chip showing the current location ("Set location" when none); opens the area picker.
 *
 * @param {{ className?: string }} props
 */
export default function LocationChip({ className = '' }) {
  const label = useLocationStore((s) => s.label);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label ? `Change location: ${label}` : 'Change location'}
        aria-haspopup="dialog"
        className={`inline-flex min-h-11 max-w-[11rem] items-center gap-1 rounded-btn px-2 font-body text-sm font-semibold text-ink hover:bg-lavender active:bg-lavender motion-safe:transition-colors motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      >
        <MapPin size={18} strokeWidth={1.75} aria-hidden="true" className="flex-shrink-0 text-primary" />
        <span className="truncate">{label ?? 'Set location'}</span>
        <ChevronDown size={14} strokeWidth={2} aria-hidden="true" className="flex-shrink-0 text-muted" />
      </button>
      <AreaPickerSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
