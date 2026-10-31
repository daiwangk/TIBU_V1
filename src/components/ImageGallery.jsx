import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ImagePlaceholder from './ui/ImagePlaceholder';

/**
 * Swipeable scroll-snap image gallery with dot indicators, keyboard arrow navigation and prev/next buttons.
 *
 * @param {{
 *   images?: Array<{ url: string, alt?: string, sortOrder?: number }>,
 *   name?: string,
 *   className?: string,
 * }} props
 */
export default function ImageGallery({ images = [], name = 'Product', className = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef(null);

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

  function scrollTo(index) {
    const el = scrollerRef.current;
    if (!el) return;
    const target = Math.max(0, Math.min(index, images.length - 1));
    el.scrollTo({ left: target * el.clientWidth, behavior: 'smooth' });
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollTo(activeIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollTo(activeIndex + 1);
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-card bg-surface ${className}`}>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        tabIndex={0}
        aria-label={`${name} images. Use arrow keys to navigate.`}
      >
        {images.map((img, i) => (
          <div
            key={`${img.id ?? img.url}-${i}`}
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
          {/* Previous / Next buttons for mouse and touch access */}
          <button
            type="button"
            onClick={() => scrollTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-surface/80 text-ink shadow-sm backdrop-blur-sm transition-opacity hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollTo(activeIndex + 1)}
            disabled={activeIndex === images.length - 1}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-surface/80 text-ink shadow-sm backdrop-blur-sm transition-opacity hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>

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
