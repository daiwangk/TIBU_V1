import Chip from './ui/Chip';

/**
 * Row of category filter chips.
 *
 * @param {{
 *   categories: Array<{ slug: string, name: string }>,
 *   value: string | null,
 *   onChange: (slug: string | null) => void,
 *   className?: string,
 * }} props
 */
export default function CategoryChips({ categories, value, onChange, className = '' }) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto no-scrollbar px-screen ${className}`}
      role="group"
      aria-label="Filter by category"
    >
      {/* "All" chip */}
      <Chip active={value == null} onToggle={() => onChange(null)}>
        All
      </Chip>

      {categories.map((cat) => (
        <Chip
          key={cat.slug}
          active={value === cat.slug}
          onToggle={() => onChange(value === cat.slug ? null : cat.slug)}
        >
          {cat.name}
        </Chip>
      ))}
    </div>
  );
}
