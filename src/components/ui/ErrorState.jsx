import { AlertCircle } from 'lucide-react';
import Button from './Button';

/**
 * Error state with retry.
 *
 * @param {{
 *   message?: string,
 *   onRetry?: () => void,
 *   className?: string,
 * }} props
 */
export default function ErrorState({
  message = 'Something went wrong.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-12 px-screen text-center ${className}`}
    >
      <span className="flex items-center justify-center w-16 h-16 rounded-full bg-blush text-ink">
        <AlertCircle size={28} strokeWidth={1.75} />
      </span>
      <p className="font-body text-body text-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
