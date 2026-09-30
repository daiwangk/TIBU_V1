import { useEffect, useRef } from 'react';
import IconButton from './IconButton';
import { X } from 'lucide-react';

/**
 * Centred modal dialog built on native `<dialog>`.
 *
 * - Same mechanics as Sheet (scroll lock, focus return, Escape/backdrop close).
 * - On screens wider than 480px it stays inside the centred 480px column.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   title?: string,
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function Dialog({ open, onClose, title, children, className = '' }) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      triggerRef.current = document.activeElement;
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      if (dialog.open) dialog.close();
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function handleDialogClick(e) {
    if (e.target === dialogRef.current) onClose();
  }

  function handleCancel(e) {
    e.preventDefault();
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onCancel={handleCancel}
      className={`
        m-0 p-0 border-0 bg-transparent max-h-none max-w-none w-full h-full
        backdrop:bg-ink/40 backdrop:backdrop-blur-sm
        open:flex open:items-center open:justify-center
      `}
    >
      {/* Inner panel — stays within 480px column */}
      <div
        className={`
          w-full max-w-[480px] mx-4
          bg-surface rounded-card-lg
          overflow-y-auto overscroll-contain
          max-h-[85dvh]
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="font-heading font-bold text-ink text-base">{title}</h2>
            <IconButton label="Close dialog" onClick={onClose} className="-mr-2">
              <X size={20} strokeWidth={2} aria-hidden="true" />
            </IconButton>
          </div>
        )}
        {children}
      </div>
    </dialog>
  );
}
