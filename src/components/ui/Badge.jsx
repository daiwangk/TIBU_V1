/**
 * Small status badge.
 *
 * Tones map to existing theme.css tokens only — no hex values.
 *   neutral → bg-lavender / text-ink
 *   success → bg-mint / text-ink
 *   warning → bg-blush / text-ink
 *   plum    → bg-primary / text-primary-fg  (no plum token → use primary)
 *
 * @param {{
 *   tone?: 'neutral' | 'success' | 'warning' | 'plum',
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function Badge({ tone = 'neutral', children, className = '' }) {
  const toneClasses = {
    neutral: 'bg-lavender text-ink',
    success: 'bg-mint text-ink',
    warning: 'bg-blush text-ink',
    plum: 'bg-primary text-primary-fg',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        rounded-full text-xs font-body font-semibold
        ${toneClasses[tone] ?? toneClasses.neutral}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
