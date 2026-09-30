import { formatPrice } from '../lib/format';

/**
 * Formatted price display.
 *
 * @param {{
 *   value: number,
 *   size?: 'sm' | 'md' | 'lg',
 *   className?: string,
 * }} props
 */
export default function Price({ value, size = 'md', className = '' }) {
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  }[size] ?? 'text-base';

  return (
    <span className={`font-heading font-bold text-ink ${sizeClass} ${className}`}>
      {formatPrice(value)}
    </span>
  );
}
