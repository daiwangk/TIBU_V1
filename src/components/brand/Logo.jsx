import { useState } from 'react';
import logoSrc from '../../assets/logo.png';

/**
 * Brand logo — renders the tibu PNG asset.
 * Falls back to a pure-text wordmark if the image fails to load,
 * so the component is always safe to render even before the final
 * logo asset is confirmed.
 *
 * @param {{ className?: string }} props
 */
export default function Logo({ className = '' }) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    // Text wordmark fallback: "ti" bold plum, "bu" lighter
    return (
      <span
        aria-label="tibu"
        className={`font-heading text-primary select-none leading-none ${className}`}
      >
        <span className="font-bold">ti</span>
        <span className="font-normal">bu</span>
      </span>
    );
  }

  return (
    <img
      src={logoSrc}
      alt="tibu"
      className={`object-contain h-8 w-auto ${className}`}
      onError={() => setImgError(true)}
    />
  );
}
