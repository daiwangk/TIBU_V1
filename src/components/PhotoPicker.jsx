import { useRef } from 'react';
import Button from './ui/Button';

/**
 * A button that opens the phone's photo picker (camera or gallery). Calls `onPick` with the chosen files.
 *
 * @param {{
 *   label: React.ReactNode,
 *   onPick: (files: File[]) => void,
 *   multiple?: boolean,
 *   disabled?: boolean,
 *   variant?: 'primary' | 'secondary' | 'accent' | 'ghost',
 *   className?: string,
 * }} props
 */
export default function PhotoPicker({ label, onPick, multiple = false, disabled = false, variant = 'secondary', className = '' }) {
  const inputRef = useRef(null);

  function handleChange(e) {
    const files = Array.from(e.target.files ?? []);
    // Clear it so choosing the same photo again still fires a change.
    e.target.value = '';
    if (files.length > 0) onPick(files);
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} hidden onChange={handleChange} />
      <Button type="button" variant={variant} disabled={disabled} className={className} onClick={() => inputRef.current?.click()}>
        {label}
      </Button>
    </>
  );
}
