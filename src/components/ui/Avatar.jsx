/**
 * User avatar — shows image when available, falls back to initials.
 *
 * Supported sizes (px): 32, 36, 40, 48, 56, 64.
 * For custom sizes use the `className` prop with Tailwind w-/h- utilities.
 *
 * @param {{
 *   src?: string | null,
 *   name?: string,
 *   size?: 32 | 36 | 40 | 48 | 56 | 64,
 *   className?: string,
 * }} props
 */
export default function Avatar({ src, name = '', size = 40, className = '' }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const sizeClass = {
    32: 'w-8 h-8 text-xs',
    36: 'w-9 h-9 text-xs',
    40: 'w-10 h-10 text-sm',
    48: 'w-12 h-12 text-base',
    56: 'w-14 h-14 text-lg',
    64: 'w-16 h-16 text-xl',
  }[size] ?? 'w-10 h-10 text-sm';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`rounded-full object-cover flex-shrink-0 ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <span
      aria-label={name || 'Avatar'}
      className={`
        rounded-full flex-shrink-0 inline-flex items-center justify-center
        bg-lavender text-ink font-heading font-bold select-none
        ${sizeClass} ${className}
      `}
    >
      {initials || '?'}
    </span>
  );
}
