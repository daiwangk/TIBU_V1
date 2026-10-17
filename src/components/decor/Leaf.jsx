/**
 * Decor: a single line-art leaf with a stem and midrib. Corners of heroes and sheets only, sparingly.
 * Colour comes from `currentColor` (e.g. `text-sage`); size from className.
 *
 * @param {{ className?: string }} props
 */
export default function Leaf({ className = '' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M6 27C6 15 13 6 27 5c-.5 13-8.5 21-21 22Z" />
      <path d="M3 30l3-3M6 27C11 21 16 15 21 10.5M12 20.5l-.5-4.5M16 16l4 .5M15.5 16.5l-.5-4" />
    </svg>
  );
}
