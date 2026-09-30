/**
 * Toggleable chip — for filter or selection UIs.
 *
 * @param {{
 *   active?: boolean,
 *   onToggle?: () => void,
 *   children: React.ReactNode,
 *   className?: string,
 *   [key: string]: any,
 * }} props
 */
export default function Chip({ active = false, onToggle, children, className = '', ...rest }) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={active}
      onClick={onToggle}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5
        rounded-full text-sm font-body font-semibold
        min-h-[36px] transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${
          active
            ? 'bg-primary text-primary-fg'
            : 'bg-surface text-body border border-border hover:bg-lavender'
        }
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
}
