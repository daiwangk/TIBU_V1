/**
 * Key-value details grid for a product.
 * Hidden if details array is empty.
 *
 * @param {{
 *   details?: Array<{ label: string, value: string }>,
 *   className?: string,
 * }} props
 */
export default function ProductDetailsList({ details = [], className = '' }) {
  if (!details || details.length === 0) return null;

  return (
    <section className={`mt-5 ${className}`}>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
        Details
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {details.map((item, idx) => (
          <div
            key={item.label || idx}
            className="p-3 rounded-card bg-surface border border-border flex flex-col justify-center"
          >
            <span className="text-xs text-muted font-medium truncate">{item.label}</span>
            <span className="text-sm font-semibold text-ink mt-0.5 truncate">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
