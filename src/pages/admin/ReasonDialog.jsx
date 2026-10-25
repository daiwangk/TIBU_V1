import { useState } from 'react';
import Button from '../../components/ui/Button';
import Dialog from '../../components/ui/Dialog';
import Textarea from '../../components/ui/Textarea';
import { REASON_MIN, validateReason } from './adminModel';

function ReasonForm({ confirmLabel, onConfirm, onCancel, loading, serverError }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    const message = validateReason(reason);
    setError(message);
    if (!message) onConfirm(reason.trim());
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-4">
      <Textarea
        id="admin-reason"
        label="Reason"
        hint={`The seller sees this. At least ${REASON_MIN} characters.`}
        error={error ?? serverError ?? undefined}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
      />
      <div className="flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" variant="danger" className="flex-1" loading={loading}>{confirmLabel}</Button>
      </div>
    </form>
  );
}

/**
 * Asks for the reason the seller will see when an application is rejected or a shop unpublished.
 * The form only exists while open, so every opening starts empty.
 *
 * @param {{
 *   open: boolean,
 *   title: string,
 *   confirmLabel: string,
 *   onConfirm: (reason: string) => void,
 *   onCancel: () => void,
 *   loading?: boolean,
 *   serverError?: string|null,
 * }} props
 */
export default function ReasonDialog({ open, title, confirmLabel, onConfirm, onCancel, loading = false, serverError = null }) {
  return (
    <Dialog open={open} onClose={loading ? () => {} : onCancel} title={title}>
      {open && (
        <ReasonForm
          confirmLabel={confirmLabel}
          onConfirm={onConfirm}
          onCancel={onCancel}
          loading={loading}
          serverError={serverError}
        />
      )}
    </Dialog>
  );
}
