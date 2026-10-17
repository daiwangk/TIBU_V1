/**
 * Illustration for the Saved empty state: a plum bookmark with a coral heart, two sage leaves and
 * doodle hearts on a soft-sage blob. The only place a bookmark appears; save itself is always a heart (D40).
 * Original artwork, aria-hidden, static. Size from className (about 4:3).
 *
 * @param {{ className?: string }} props
 */
export default function BookmarkHeart({ className = '' }) {
  return (
    <svg viewBox="0 0 160 120" fill="none" aria-hidden="true" focusable="false" className={className}>
      <path
        className="text-mint"
        fill="currentColor"
        d="M34 26c18-18 62-22 88-8s32 46 22 70-40 34-70 30-50-16-54-40 0-38 14-52Z"
      />
      <g className="text-sage" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 96c0-14 8-24 22-26-1 14-9 24-22 26ZM30 96l14-16" />
        <path d="M132 34c-2 12-10 19-22 19 2-12 10-19 22-19ZM110 53l12-10" />
      </g>
      <path
        className="text-primary"
        fill="currentColor"
        d="M62 22h36a6 6 0 0 1 6 6v68l-24-14-24 14V28a6 6 0 0 1 6-6Z"
      />
      <path
        className="text-coral"
        fill="currentColor"
        d="M80 64c-7-4.5-11-9-11-14a6 6 0 0 1 11-3.3A6 6 0 0 1 91 50c0 5-4 9.5-11 14Z"
      />
      <g className="text-coral" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M120 82c-3-2-5-4-5-6.3a2.6 2.6 0 0 1 5-1.3 2.6 2.6 0 0 1 5 1.3c0 2.3-2 4.3-5 6.3Z" />
        <path d="M42 40c-2.4-1.6-4-3.2-4-5a2.1 2.1 0 0 1 4-1 2.1 2.1 0 0 1 4 1c0 1.8-1.6 3.4-4 5Z" />
        <path d="M112 16l2 4M118 14l-1 4" />
      </g>
    </svg>
  );
}
