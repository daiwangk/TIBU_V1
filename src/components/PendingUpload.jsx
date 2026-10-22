import { useCallback, useEffect, useRef, useState } from 'react';
import { userMessage } from '../lib/errors';
import Button from './ui/Button';
import Spinner from './ui/Spinner';

/**
 * One photo on its way to the server, as a row: a small preview (`preview`, an object URL the parent
 * made when the file was chosen and revokes when the row goes), its state — waiting, uploading or
 * failed (with the reason, Retry and Remove). `upload(file)` does the work; `onDone` fires when it
 * succeeds, so the parent can drop this row and show the saved image instead. `active` lets a parent
 * run uploads one at a time: a waiting row starts only while it is active, and Retry puts a failed row
 * back in the queue. `onStatusChange('waiting' | 'uploading' | 'error')` lets the parent see where the
 * queue is.
 *
 * @param {{
 *   file: File,
 *   preview: string|null,
 *   upload: (file: File) => Promise<unknown>,
 *   onDone: () => void,
 *   onDismiss: () => void,
 *   onStatusChange?: (status: 'waiting' | 'uploading' | 'error') => void,
 *   active?: boolean,
 *   className?: string,
 * }} props
 */
export default function PendingUpload({ file, preview, upload, onDone, onDismiss, onStatusChange, active = true, className = '' }) {
  const [status, setStatus] = useState('waiting');
  const [error, setError] = useState(null);
  const running = useRef(false);
  const statusCallback = useRef(onStatusChange);

  useEffect(() => {
    statusCallback.current = onStatusChange;
  });
  useEffect(() => {
    statusCallback.current?.(status);
  }, [status]);

  const run = useCallback(async () => {
    setStatus('uploading');
    try {
      await upload(file);
      onDone();
    } catch (err) {
      setError(err);
      setStatus('error');
    } finally {
      running.current = false;
    }
  }, [upload, file, onDone]);

  useEffect(() => {
    if (active && status === 'waiting' && !running.current) {
      running.current = true;
      run();
    }
  }, [active, status, run]);

  function retry() {
    setError(null);
    setStatus('waiting');
  }

  return (
    <div className={`flex items-center gap-3 rounded-card border border-border bg-surface p-2 ${className}`}>
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-card bg-lavender">
        {preview && <img src={preview} alt="Photo being uploaded" className="h-full w-full object-cover" />}
      </div>
      <div aria-live="polite" className="flex min-w-0 flex-1 flex-col items-start gap-1 font-body text-sm text-ink">
        {status === 'waiting' && <span>Waiting…</span>}
        {status === 'uploading' && (
          <span className="flex items-center gap-2">
            <Spinner />
            Uploading…
          </span>
        )}
        {status === 'error' && (
          <>
            <span role="alert" className="font-semibold text-error">{userMessage(error)}</span>
            <span className="flex gap-2">
              <Button type="button" variant="secondary" onClick={retry}>Retry</Button>
              <Button type="button" variant="ghost" onClick={onDismiss}>Remove</Button>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
