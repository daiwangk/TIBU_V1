/**
 * Horizontal scroll row with scroll-snap and 16px gutters.
 * The scrollbar is hidden visually but remains functional.
 *
 * @param {{
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function HorizontalScroller({ children, className = '' }) {
  return (
    <div
      className={`
        flex gap-3 overflow-x-auto no-scrollbar
        scroll-smooth snap-x snap-mandatory
        px-screen w-full min-w-0
        ${className}
      `}
    >
      {children}
    </div>
  );
}
