import { useState } from 'react';
import logoSrc from '../../assets/logo.png';

/**
 * Logo — renders the tibu brand logo.
 *
 * Uses the PNG asset at src/assets/logo.png.
 * Falls back to a pure-text wordmark if the image fails to load,
 * so the component is always safe to render even before the final
 * logo asset is confirmed.
 *
 * @param {string} [className] - additional CSS classes (height / spacing)
 */
export default function Logo({ className = '' }) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    // Text wordmark fallback — matches brand: "ti" bold plum, "bu" lighter
    return (
      <span
        className={`font-heading select-none leading-none ${className}`}
        style={{ color: 'var(--color-primary)', fontSize: 'inherit' }}
        aria-label="tibu"
      >
        <span style={{ fontWeight: 800 }}>ti</span>
        <span style={{ fontWeight: 400 }}>bu</span>
      </span>
    );
  }

  return (
    <img
      src={logoSrc}
      alt="tibu"
      className={`object-contain ${className}`}
      style={{ height: '2rem', width: 'auto' }}
      onError={() => setImgError(true)}
    />
  );
}
