const PETAL_ANGLES = [0, 72, 144, 216, 288];

/**
 * Decor: a five-petal line-art flower.
 * Colour comes from `currentColor` (e.g. `text-primary`); size from className.
 *
 * @param {{ className?: string }} props
 */
export default function Flower({ className = '' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PETAL_ANGLES.map((angle) => (
        <ellipse key={angle} cx="16" cy="8.5" rx="4" ry="6" transform={`rotate(${angle} 16 16)`} />
      ))}
      <circle cx="16" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}
