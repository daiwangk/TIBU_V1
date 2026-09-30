import { Loader2 } from 'lucide-react';

/**
 * Animated loading spinner.
 *
 * @param {{ size?: number, className?: string }} props
 */
export default function Spinner({ size = 20, className = '' }) {
  return (
    <Loader2
      size={size}
      strokeWidth={2}
      aria-hidden="true"
      className={`animate-spin text-primary ${className}`}
    />
  );
}
