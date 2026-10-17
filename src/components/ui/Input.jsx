/**
 * Labelled text input. 16px text so iOS Safari doesn't zoom on focus; sage border (3.5:1), error border/text.
 *
 * @param {{
 *   id: string,
 *   label?: string,
 *   hint?: string,
 *   error?: string,
 *   className?: string,
 *   [key: string]: any,
 * }} props
 */
export default function Input({ id, label, hint, error, className = '', ...rest }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-body font-semibold text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full min-h-11 px-3 py-2.5 rounded-btn
          bg-surface border font-body text-base text-ink
          placeholder:text-muted
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
          transition-colors duration-150
          disabled:opacity-50
          ${error ? 'border-error' : 'border-sage'}
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
        <span id={`${id}-error`} role="alert" className="text-xs text-error font-body font-semibold">
          {error}
        </span>
      )}
    </div>
  );
}
