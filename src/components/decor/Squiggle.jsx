/**
 * Decor: a short wavy underline stroke.
 * Colour comes from `currentColor` (e.g. `text-coral`); size from className (about 4:1 wide).
 *
 * @param {{ className?: string }} props
 */
export default function Squiggle({ className = '' }) {
  return (
    <svg
      viewBox="0 0 48 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M2 7c3.5-5 7-5 10.5 0s7 5 10.5 0 7-5 10.5 0 7 5 10.5 0" />
    </svg>
  );
}
