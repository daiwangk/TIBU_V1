import Button from './ui/Button';
import Dialog from './ui/Dialog';

/**
 * A yes / no confirmation in a Dialog.
 *
 * @param {{
 *   open: boolean,
 *   title: string,
 *   text: string,
 *   confirmLabel: string,
 *   cancelLabel?: string,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 *   loading?: boolean,
 *   danger?: boolean,
 * }} props
 */
export default function ConfirmDialog({ open, title, text, confirmLabel, cancelLabel = 'Keep it', onConfirm, onCancel, loading = false, danger = true }) {
  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <div className="flex flex-col gap-4 px-4 pb-4">
        <p className="font-body text-sm text-body">{text}</p>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>{cancelLabel}</Button>
          <Button type="button" variant={danger ? 'danger' : 'primary'} className="flex-1" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Dialog>
  );
}
