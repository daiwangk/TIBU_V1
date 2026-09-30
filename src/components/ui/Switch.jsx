/**
 * Toggle switch. role="switch" with aria-checked.
 *
 * @param {{
 *   id: string,
 *   checked: boolean,
 *   onChange: (checked: boolean) => void,
 *   label?: string,
 *   disabled?: boolean,
 *   className?: string,
 * }} props
 */
export default function Switch({ id, checked, onChange, label, disabled = false, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-body text-ink flex-1 cursor-pointer">
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex items-center
          w-11 h-6 rounded-full flex-shrink-0
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          disabled:opacity-50 disabled:pointer-events-none
          ${checked ? 'bg-primary' : 'bg-border'}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            block w-5 h-5 rounded-full bg-surface shadow-sm
            transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
}
