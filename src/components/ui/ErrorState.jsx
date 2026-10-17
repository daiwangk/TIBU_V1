import { AlertCircle } from 'lucide-react';
import Button from './Button';
import Blob from '../decor/Blob';
import { userMessage } from '../../lib/errors';

/**
 * Error state with retry: the error icon on a blush blob (error on blush 5.4:1).
 * Text comes from `message`, else `userMessage(error)`, else a generic line.
 *
 * @param {{
 *   message?: string,
 *   error?: unknown,
 *   onRetry?: () => void,
 *   className?: string,
 * }} props
 */
export default function ErrorState({
  message,
  error,
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-12 px-screen text-center ${className}`}
    >
      <span className="relative flex h-20 w-20 items-center justify-center" aria-hidden="true">
        <Blob variant={3} className="absolute inset-0 h-full w-full text-blush" />
        <AlertCircle size={28} strokeWidth={1.75} className="relative text-error" />
      </span>
      <p className="font-body text-body text-sm">{message ?? userMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
