import { useState } from 'react';
import ImagePlaceholder from './ui/ImagePlaceholder';

/**
 * Swipeable scroll-snap image gallery with dot indicators.
 *
 * @param {{
 *   images?: Array<{ url: string, alt?: string, sortOrder?: number }>,
 *   name?: string,
 *   className?: string,
 * }} props
 */
export default function ImageGallery({ images = [], name = 'Product', className = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`overflow-hidden rounded-card ${className}`}>
        <ImagePlaceholder aspect="1/1" />
      </div>
    );
  }

  function handleScroll(e) {
    const width = e.currentTarget.clientWidth;
    if (width > 0) {
      const nextIndex = Math.round(e.currentTarget.scrollLeft / width);
      if (nextIndex !== activeIndex) {
        setActiveIndex(nextIndex);
      }
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-card bg-surface ${className}`}>
      <div
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        tabIndex={0}
        aria-label={`${name} images`}
      >
        {images.map((img, i) => (
          <div
            key={img.url || i}
            className="min-w-full flex-shrink-0 snap-center aspect-square bg-surface"
          >
            <img
              src={img.url}
              alt={img.alt || `${name} - image ${i + 1}`}
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          {/* Dot indicators */}
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink/40 backdrop-blur-sm pointer-events-none"
            aria-hidden="true"
          >
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === activeIndex ? 'w-4 bg-surface' : 'w-1.5 bg-surface/60'
                }`}
              />
            ))}
          </div>

          {/* Count badge */}
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-ink/60 text-white text-xs font-medium backdrop-blur-sm pointer-events-none">
            {activeIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}
