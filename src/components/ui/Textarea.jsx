/**
 * Labelled textarea.
 *
 * @param {{
 *   id: string,
 *   label?: string,
 *   hint?: string,
 *   error?: string,
 *   rows?: number,
 *   className?: string,
 *   [key: string]: any,
 * }} props
 */
export default function Textarea({ id, label, hint, error, rows = 4, className = '', ...rest }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-body font-semibold text-ink">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`
          w-full px-3 py-2.5 rounded-btn
          bg-surface border font-body text-sm text-ink
          placeholder:text-muted resize-y
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
          transition-colors duration-150
          disabled:opacity-50
          ${error ? 'border-blush' : 'border-border'}
        `}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        {...rest}
      />
      {hint && !error && (
        <span id={`${id}-hint`} className="text-xs text-muted font-body">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} role="alert" className="text-xs text-ink font-body font-semibold">
          {error}
        </span>
      )}
    </div>
  );
}
