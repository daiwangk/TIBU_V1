/**
 * Decor: three short strokes radiating up and to the right (an emphasis spark).
 * Colour comes from `currentColor` (e.g. `text-coral`); size from className.
 *
 * @param {{ className?: string }} props
 */
export default function Spark({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M7 11V3M11 13.5l6-6M13 18h8" />
    </svg>
  );
}
