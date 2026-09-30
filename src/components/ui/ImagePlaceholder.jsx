import { ImageOff } from 'lucide-react';

/**
 * Placeholder shown when no image is available.
 * Uses a pastel background token and the lucide ImageOff icon.
 *
 * Aspect ratio is controlled via a Tailwind class on the parent or
 * one of the built-in `aspect` presets below.
 *
 * @param {{
 *   aspect?: '1/1' | '4/3' | '3/4' | '16/9',
 *   bg?: 'lavender' | 'blush' | 'lime' | 'mint',
 *   iconSize?: number,
 *   className?: string,
 * }} props
 */
export default function ImagePlaceholder({
  aspect = '1/1',
  bg = 'lavender',
  iconSize = 24,
  className = '',
}) {
  const bgClass = {
    lavender: 'bg-lavender',
    blush: 'bg-blush',
    lime: 'bg-lime',
    mint: 'bg-mint',
  }[bg] ?? 'bg-lavender';

  const aspectClass = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '3/4': 'aspect-[3/4]',
    '16/9': 'aspect-video',
  }[aspect] ?? 'aspect-square';

  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center w-full ${bgClass} ${aspectClass} ${className}`}
    >
      <ImageOff size={iconSize} strokeWidth={1.5} className="text-muted" />
    </span>
  );
}
