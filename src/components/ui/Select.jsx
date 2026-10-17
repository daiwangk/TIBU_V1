import { ChevronDown } from 'lucide-react';

/**
 * Native select wrapper with label, chevron and error state. 16px text (no iOS zoom), sage border.
 * `compact`: a chip-height pill for filter rows (e.g. Category sort / price).
 *
 * @param {{
 *   id: string,
 *   label?: string,
 *   hint?: string,
 *   error?: string,
 *   compact?: boolean,
 *   children: React.ReactNode,
 *   className?: string,
 *   [key: string]: any,
 * }} props
 */
export default function Select({ id, label, hint, error, compact = false, children, className = '', ...rest }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-body font-semibold text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`
            w-full min-h-11 appearance-none
            ${compact ? 'rounded-full py-2 pl-4 pr-9' : 'rounded-btn py-2.5 pl-3 pr-10'}
            bg-surface border font-body text-base text-ink
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
            transition-colors duration-150
            disabled:opacity-50
            ${error ? 'border-error' : 'border-sage'}
          `}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          aria-invalid={!!error}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          size={18}
          strokeWidth={2}
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-body ${compact ? 'right-3' : 'right-3.5'}`}
        />
      </div>
      {hint && !error && (
        <span id={`${id}-hint`} className="text-xs text-muted font-body">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} role="alert" className="text-xs text-error font-body font-semibold">
          {error}
        </span>
      )}
    </div>
  );
}
