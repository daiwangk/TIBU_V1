import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Password input with a show/hide toggle. Spread `register('field')` into it (React 19 passes `ref`).
 *
 * @param {{
 *   id: string,
 *   label: string,
 *   error?: string,
 *   autoComplete: 'current-password' | 'new-password',
 *   [key: string]: any,
 * }} props
 */
export default function PasswordField({ id, label, error, autoComplete, ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-body text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full min-h-11 rounded-btn border bg-surface py-2.5 pr-12 pl-3 font-body text-base text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
            error ? 'border-blush' : 'border-border'
          }`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center rounded-btn text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
      {error && (
        <span id={`${id}-error`} role="alert" className="font-body text-sm font-semibold text-primary">
          {error}
        </span>
      )}
    </div>
  );
}
