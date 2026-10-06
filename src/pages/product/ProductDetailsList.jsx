/**
 * Label / value rows for a product, as a two-column description list.
 * Hidden if the details array is empty.
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
      <dl className="rounded-card border border-border bg-surface">
        {details.map((item, idx) => (
          <div
            key={`${item.label}-${idx}`}
            className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 border-b border-border px-3 py-2.5 last:border-b-0"
          >
            <dt className="font-body text-sm text-muted break-words">{item.label}</dt>
            <dd className="font-body text-sm font-semibold text-ink break-words">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
