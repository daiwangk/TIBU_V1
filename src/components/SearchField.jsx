import { Search, X } from 'lucide-react';

/**
 * Presentational search pill: magnifier, 16px text (no iOS zoom), sage border, optional clear button
 * and a `trailing` slot (e.g. the filters button). Pages own all state and behaviour; every other prop
 * (`value`, `onChange`, `onClick`, `onKeyDown`, `autoFocus`, `enterKeyHint`, `id`…) goes to the <input>.
 * Pass `label` for the accessible name, or an `id` with your own <label>.
 * A long placeholder ends in "…" instead of clipping under the trailing buttons; keep it short anyway.
 *
 * @param {{
 *   label?: string,
 *   onClear?: () => void,
 *   trailing?: React.ReactNode,
 *   className?: string,
 *   [key: string]: any,
 * }} props
 */
export default function SearchField({ label, onClear, trailing, className = '', ...inputProps }) {
  const showClear = Boolean(onClear && inputProps.value);
  const endSlots = (showClear ? 1 : 0) + (trailing ? 1 : 0);
  const padRight = ['pr-4', 'pr-12', 'pr-24'][endSlots];

  return (
    <div className={`relative ${className}`}>
      <Search
        size={20}
        strokeWidth={1.75}
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        aria-label={label}
        {...inputProps}
        className={`w-full min-h-12 rounded-full border border-sage bg-surface pl-12 ${padRight} font-body text-base text-ink text-ellipsis placeholder:text-muted [&::-webkit-search-cancel-button]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-safe:transition-shadow motion-safe:duration-150`}
      />
      {endSlots > 0 && (
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
          {showClear && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear search"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
          {trailing}
        </div>
      )}
    </div>
  );
}
