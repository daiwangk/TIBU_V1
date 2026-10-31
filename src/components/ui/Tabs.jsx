/**
 * Controlled tab bar with WAI-ARIA arrow-key navigation.
 *
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   items: Array<{ value: string, label: string }>,
 *   label?: string,
 *   className?: string,
 * }} props
 */
export default function Tabs({ value, onChange, items, label, className = '' }) {
  function handleKeyDown(e, currentIndex) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % items.length;
      onChange(items[nextIndex].value);
      const nextTab = document.getElementById(`tab-${items[nextIndex].value}`);
      nextTab?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      onChange(items[prevIndex].value);
      const prevTab = document.getElementById(`tab-${items[prevIndex].value}`);
      prevTab?.focus();
    }
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={`flex border-b border-border gap-0 overflow-x-auto no-scrollbar ${className}`}
    >
      {items.map((item, index) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            id={`tab-${item.value}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, index)}
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
