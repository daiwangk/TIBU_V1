/**
 * Decor: a hand-drawn heart outline with a small flourish. Not the save control
 * (that is `SaveButton`'s lucide heart); this is illustration only.
 * Colour comes from `currentColor` (e.g. `text-coral`); size from className.
 *
 * @param {{ className?: string }} props
 */
export default function HeartDoodle({ className = '' }) {
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
      <path d="M16 26.5c-6-3.8-10.5-8-10.5-13A5.3 5.3 0 0 1 16 10.4a5.3 5.3 0 0 1 10.5 3.1c0 5-4.5 9.2-10.5 13Z" />
      <path d="M24.5 4.5l1 2.5M28.5 7.5l-2.5 1" />
    </svg>
  );
}
