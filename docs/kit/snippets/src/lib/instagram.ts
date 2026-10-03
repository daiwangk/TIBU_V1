// src/lib/instagram.ts — Reel link → embed (no API key; SOW §3 "Note on Reels")
const RE = /instagram\.com\/(?:[A-Za-z0-9._]+\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]{5,40})/i;

export function parseInstagramShortcode(url: string): string | null {
  const m = url.trim().match(RE);
  return m ? m[1] : null;
}

export const reelEmbedUrl = (shortcode: string) =>
  `https://www.instagram.com/reel/${shortcode}/embed`;

/*
<iframe
  src={reelEmbedUrl(video.shortcode)}
  className="w-full aspect-[9/16] rounded-xl border-0"
  loading="lazy" allowFullScreen
  title={video.caption ?? 'Instagram reel'} />

If the account goes private / reel is deleted, Instagram renders an
"unavailable" card inside the iframe — show a small "Watch on Instagram" link under it.
*/
