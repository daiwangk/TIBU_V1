/**
 * Icon-only button with required accessible label.
 * Always renders a `<button>` — 44×44 minimum touch target.
 *
 * @param {{
 *   label: string,
 *   children: React.ReactNode,
 *   className?: string,
 *   [key: string]: any,
 * }} props
 */
export default function IconButton({ label, children, className = '', ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`
        inline-flex items-center justify-center
        min-w-[44px] min-h-[44px] rounded-btn
        text-body hover:bg-lavender active:bg-lavender
        transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
}
