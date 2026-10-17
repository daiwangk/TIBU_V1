/**
 * Brand tagline in the script font (Caveat 600). Sage-strong text: 4.9:1 on `bg` (D40).
 *
 * @param {{ className?: string }} props
 */
export default function Tagline({ className = '' }) {
  return (
    <span className={`block font-script text-lg font-semibold leading-tight text-sage-strong ${className}`}>
      Discover Homegrown Businesses around you.
    </span>
  );
}
