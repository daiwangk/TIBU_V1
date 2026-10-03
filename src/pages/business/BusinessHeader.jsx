import { useState, useRef, useLayoutEffect } from 'react';
import { MapPin, Truck, Store, ChevronDown, ChevronUp } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import Distance from '../../components/Distance';
import Rating from '../../components/Rating';

/**
 * @param {{ business: import('../../services/contract').BusinessDetail }} props
 */
export default function BusinessHeader({ business }) {
  const [isClamped, setIsClamped] = useState(true);
  const [showToggle, setShowToggle] = useState(false);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    if (textRef.current) {
      // If the scrollHeight is greater than clientHeight, text is clamped
      setShowToggle(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, [business.description]);

  return (
    <section className="bg-surface border-b border-border pb-4">
      {/* Banner */}
      <div className="relative w-full aspect-video bg-lavender">
        {business.bannerUrl ? (
          <img
            src={business.bannerUrl}
            alt={`${business.name} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImagePlaceholder aspect="16/9" bg="blush" iconSize={48} />
        )}
        {/* Soft bottom gradient for readability if needed, though logo overlap usually handles it */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" aria-hidden="true" />
      </div>

      {/* Info Content */}
      <div className="px-screen -mt-10 relative z-10 flex flex-col items-start">
        <Avatar
          src={business.logoUrl}
          name={business.name}
          size={64}
          className="ring-4 ring-surface bg-surface"
        />

        <div className="mt-3 w-full">
          <h1 className="font-heading font-bold text-ink text-2xl leading-tight">
            {business.name}
          </h1>
          <p className="font-body text-sm font-semibold text-primary mt-0.5">
            {business.categoryName}
          </p>

          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2 text-sm">
            <span className="flex items-center gap-1 text-muted">
              <MapPin size={14} aria-hidden="true" />
              {business.locality}
            </span>
            {business.distanceM != null && (
              <>
                <span className="text-muted text-xs">•</span>
                <Distance distanceM={business.distanceM} />
              </>
            )}
            <span className="text-muted text-xs">•</span>
            <Rating rating={business.rating} reviewCount={business.reviewCount} />
          </div>

          <div className="flex gap-2 mt-3">
            {business.deliveryAvailable && (
              <Badge tone="success" className="gap-1 px-2.5 py-1">
                <Truck size={12} aria-hidden="true" />
                Delivery
              </Badge>
            )}
            {business.pickupAvailable && (
              <Badge tone="neutral" className="gap-1 px-2.5 py-1">
                <Store size={12} aria-hidden="true" />
                Pickup
              </Badge>
            )}
          </div>

          {business.description && (
            <div className="mt-4 space-y-1">
              <p
                ref={textRef}
                className={`font-body text-sm text-body leading-relaxed whitespace-pre-line ${
                  isClamped ? 'line-clamp-4' : ''
                }`}
              >
                {business.description}
              </p>
              {showToggle && (
                <button
                  type="button"
                  onClick={() => setIsClamped(!isClamped)}
                  className="flex items-center gap-1 text-primary text-sm font-semibold hover:opacity-80 active:opacity-70 transition-opacity"
                >
                  {isClamped ? (
                    <>Read more <ChevronDown size={16} aria-hidden="true" /></>
                  ) : (
                    <>Show less <ChevronUp size={16} aria-hidden="true" /></>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
