import { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import AreaPickerSheet from './AreaPickerSheet';
import { useLocationStore } from '../stores/location';

/**
 * Header chip showing the current location ("Set location" when none); opens the area picker.
 * A soft-sage pill inside a 44 px touch target. Text on mint stays ink/body/primary (D40).
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
        className={`group inline-flex min-h-11 max-w-[11rem] items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      >
        <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-mint py-1.5 pr-2.5 pl-2 font-body text-sm font-semibold text-ink group-hover:brightness-95 group-active:brightness-95 motion-safe:transition motion-safe:duration-150">
          <MapPin size={16} strokeWidth={2} aria-hidden="true" className="flex-shrink-0 text-primary" />
          <span className="truncate">{label ?? 'Set location'}</span>
          <ChevronDown size={14} strokeWidth={2} aria-hidden="true" className="flex-shrink-0 text-body" />
        </span>
      </button>
      <AreaPickerSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
