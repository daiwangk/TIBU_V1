import { describe, expect, it } from 'vitest';
import { parseInstagramShortcode, reelEmbedUrl } from './instagram.js';

describe('Instagram helpers', () => {
  it.each([
    ['https://www.instagram.com/reel/Cookie_123/', 'Cookie_123'],
    ['https://instagram.com/reels/Cookie_123?igsh=abc', 'Cookie_123'],
    ['https://www.instagram.com/p/Cookie_123', 'Cookie_123'],
    ['https://www.instagram.com/tv/Cookie_123/', 'Cookie_123'],
    ['https://www.instagram.com/tibu/reel/Cookie_123/?utm_source=test', 'Cookie_123'],
  ])('parses %s', (url, expected) => {
    expect(parseInstagramShortcode(url)).toBe(expected);
  });

  it('rejects invalid or non-Instagram URLs', () => {
    expect(parseInstagramShortcode('https://example.com/reel/Cookie_123')).toBeNull();
    expect(parseInstagramShortcode('https://instagram.com/reel/no')).toBeNull();
    expect(parseInstagramShortcode('not a URL')).toBeNull();
  });

  it('creates the public reel embed URL for a valid shortcode', () => {
    expect(reelEmbedUrl('Cookie_123')).toBe(
      'https://www.instagram.com/reel/Cookie_123/embed',
    );
  });

  it('returns null for shortcodes that fail the CONTRACT §12 regex', () => {
    expect(reelEmbedUrl('no')).toBeNull();
    expect(reelEmbedUrl('')).toBeNull();
    expect(reelEmbedUrl('../evil')).toBeNull();
    expect(reelEmbedUrl(null)).toBeNull();
    expect(reelEmbedUrl('a'.repeat(41))).toBeNull();
    expect(reelEmbedUrl('a'.repeat(40))).not.toBeNull();
    expect(reelEmbedUrl('a'.repeat(4))).toBeNull();
    expect(reelEmbedUrl('a'.repeat(5))).not.toBeNull();
  });
});
