import { Link } from 'react-router-dom';
import Spinner from './Spinner';

/**
 * Primary action button.
 *
 * Renders as:
 *   - `<a>` when `href` is given (external links)
 *   - `<Link>` when `to` is given (internal navigation)
 *   - `<button>` otherwise
 *
 * @param {{
 *   variant?: 'primary' | 'secondary' | 'ghost' | 'danger',
 *   size?: 'sm' | 'md' | 'lg',
 *   loading?: boolean,
 *   disabled?: boolean,
 *   href?: string,
 *   to?: string,
 *   children: React.ReactNode,
 *   className?: string,
 *   [key: string]: any,
 * }} props
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  href,
  to,
  children,
  className = '',
  ...rest
}) {
  const variantClasses = {
    primary:
      'bg-primary text-primary-fg hover:opacity-90 active:opacity-80',
    secondary:
      'bg-surface text-primary border border-primary hover:bg-lavender active:bg-lavender',
    ghost:
      'bg-transparent text-body hover:bg-lavender active:bg-lavender',
    danger:
      'bg-blush text-ink border border-blush hover:opacity-90 active:opacity-80',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[52px]',
  };

  const base = `
    inline-flex items-center justify-center gap-2
    rounded-btn font-body font-semibold
    transition-opacity duration-150
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none
    ${variantClasses[variant] ?? variantClasses.primary}
    ${sizeClasses[size] ?? sizeClasses.md}
    ${className}
  `;

  const isDisabled = disabled || loading;
  const content = (
    <>
      {loading && <Spinner size={16} className="text-current" />}
      {children}
    </>
  );

  if (href) {
    return (
      <a href={href} className={base} aria-disabled={isDisabled} {...rest}>
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} className={base} aria-disabled={isDisabled} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" disabled={isDisabled} className={base} {...rest}>
      {content}
    </button>
  );
}
