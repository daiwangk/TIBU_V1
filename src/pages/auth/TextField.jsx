/**
 * Labelled text input for the auth forms. 16px text so iOS Safari doesn't zoom the page on focus.
 * Spread `register('field')` into it (React 19 passes `ref`).
 *
 * @param {{ id: string, label: string, error?: string, [key: string]: any }} props
 */
export default function TextField({ id, label, error, ...rest }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-body text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full min-h-11 rounded-btn border bg-surface px-3 py-2.5 font-body text-base text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
          error ? 'border-blush' : 'border-border'
        }`}
        {...rest}
      />
      {error && (
        <span id={`${id}-error`} role="alert" className="font-body text-xs font-semibold text-ink">
          {error}
        </span>
      )}
    </div>
  );
}
