import { reelEmbedUrl } from '../lib/instagram';

/**
 * Renders an Instagram Reel embed, falling back to a link if the shortcode is invalid
 * or cannot be parsed.
 *
 * @param {{
 *   video: import('../services/contract').Video,
 *   className?: string
 * }} props
 */
export default function ReelEmbed({ video, className = '' }) {
  const src = reelEmbedUrl(video.shortcode);

  return (
    <figure className={`rounded-card overflow-hidden border border-border bg-surface flex flex-col ${className}`}>
      {src ? (
        <iframe
          src={src}
          title={video.caption || 'Instagram reel'}
          loading="lazy"
          className="w-full aspect-[9/16] border-0"
          allowFullScreen
        />
      ) : (
        <div className="w-full aspect-[9/16] bg-lavender flex items-center justify-center p-4 text-center">
          <a
            href={video.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm font-semibold text-primary underline hover:opacity-80"
          >
            Watch on Instagram
          </a>
        </div>
      )}
      {video.caption && (
        <figcaption className="px-3 py-2 text-sm font-body text-body bg-surface border-t border-border">
          {video.caption}
        </figcaption>
      )}
    </figure>
  );
}
