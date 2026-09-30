/**
 * Controlled tab bar.
 *
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   items: Array<{ value: string, label: string }>,
 *   className?: string,
 * }} props
 */
export default function Tabs({ value, onChange, items, className = '' }) {
  return (
    <div
      role="tablist"
      className={`flex border-b border-border gap-0 overflow-x-auto no-scrollbar ${className}`}
    >
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            id={`tab-${item.value}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${item.value}`}
            onClick={() => onChange(item.value)}
            className={`
              flex-shrink-0 px-4 py-3 text-sm font-body font-semibold
              border-b-2 transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
              ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-body'
              }
            `}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
