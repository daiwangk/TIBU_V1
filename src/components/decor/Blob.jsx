const PATHS = {
  1: 'M46 30C70 8 118 4 150 24s46 64 34 102-48 64-92 60S14 150 10 110s12-58 36-80Z',
  2: 'M100 14c36 0 74 16 84 52s-8 74-38 96-74 30-104 10S8 112 18 76s46-62 82-62Z',
  3: 'M58 20c30-14 72-12 98 10s34 62 22 94-44 62-84 64-74-20-82-56 16-98 46-112Z',
};

/**
 * Decor: a filled organic blob, placed behind an icon or illustration. Never behind text.
 * Colour comes from `currentColor` (e.g. `text-mint`); size from className.
 *
 * @param {{ variant?: 1 | 2 | 3, className?: string }} props
 */
export default function Blob({ variant = 1, className = '' }) {
  return (
    <svg viewBox="0 0 200 200" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path d={PATHS[variant] ?? PATHS[1]} />
    </svg>
  );
}
