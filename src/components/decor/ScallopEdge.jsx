import { useId } from 'react';

/**
 * Decor: a full-width strip of 12 px scallops that finishes a colour block.
 * `side="bottom"` hangs below a block (bumps point down); `side="top"` sits above one (bumps point up).
 * Colour comes from `currentColor` and must match the block (e.g. `text-blush`).
 *
 * @param {{ side?: 'top' | 'bottom', className?: string }} props
 */
export default function ScallopEdge({ side = 'bottom', className = '' }) {
  // useId output contains characters that break url(#…) references in some browsers.
  const patternId = `scallop-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const tile = side === 'top' ? 'M0 10H12V6A6 6 0 0 0 0 6Z' : 'M0 0H12V4A6 6 0 0 1 0 4Z';

  return (
    <svg aria-hidden="true" focusable="false" className={`block h-2.5 w-full ${className}`}>
      <defs>
        <pattern id={patternId} width="12" height="10" patternUnits="userSpaceOnUse">
          <path d={tile} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="10" fill={`url(#${patternId})`} />
    </svg>
  );
}
