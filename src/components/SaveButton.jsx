import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import IconButton from './ui/IconButton';

/**
 * Save button for saving products or businesses.
 *
 * @param {{
 *   kind: 'product' | 'business',
 *   id: string,
 *   className?: string,
 * }} props
 */
export default function SaveButton({ kind, id, className = '' }) {
  function handleSave() {
    toast('Saving arrives with accounts');
  }

  const label = kind === 'business' ? 'Save business' : 'Save product';

  return (
    <IconButton
      label={label}
      onClick={handleSave}
      className={`text-ink hover:text-primary ${className}`}
      data-save-kind={kind}
      data-save-id={id}
    >
      <Heart size={20} aria-hidden="true" />
    </IconButton>
  );
}
