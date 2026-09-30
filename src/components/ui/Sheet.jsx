import { useEffect, useRef } from 'react';

/**
 * Bottom sheet built on native `<dialog>`.
 *
 * - Closes on backdrop click and Escape (native dialog handles Escape).
 * - Locks body scroll while open.
 * - Returns focus to trigger on close.
 * - On screens wider than 480px it stays inside the centred 480px column.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function Sheet({ open, onClose, children, className = '' }) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  // Open / close the dialog imperatively
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
    // Backdrop click: the click target IS the dialog element itself
    if (e.target === dialogRef.current) onClose();
  }

  function handleCancel(e) {
    // Escape key fires 'cancel' on native dialog — prevent default close then call onClose
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
        open:flex open:items-end open:justify-center
      `}
    >
      {/* Inner panel — stays within 480px column */}
      <div
        className={`
          w-full max-w-[480px]
          bg-surface rounded-t-card-lg
          overflow-y-auto overscroll-contain
          max-h-[90dvh]
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle visual only */}
        <div className="flex justify-center pt-3 pb-1">
          <span className="w-10 h-1 rounded-full bg-border" aria-hidden="true" />
        </div>
        {children}
      </div>
    </dialog>
  );
}
