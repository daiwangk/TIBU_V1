import { Tag } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { CATEGORY_ICONS, getCategoryIcon } from './categoryIcons.js';

/** CONTRACT §2 category slugs — keep in sync with docs/CONTRACT.md. */
const CONTRACT_SLUGS = [
  'desserts',
  'food',
  'handmade',
  'crochet',
  'embroidery',
  'resin-art',
  'candles',
  'fashion',
  'womens-fashion',
  'mens-fashion',
  'jewellery',
  'gifts',
];

describe('category icons', () => {
  it('maps every CONTRACT §2 slug to an explicit icon (not the Tag fallback)', () => {
    for (const slug of CONTRACT_SLUGS) {
      expect(CATEGORY_ICONS).toHaveProperty(slug);
      expect(getCategoryIcon(slug)).not.toBe(Tag);
      expect(getCategoryIcon(slug)).toBe(CATEGORY_ICONS[slug]);
    }
  });

  it('falls back to Tag for unknown slugs', () => {
    expect(getCategoryIcon('not-a-category')).toBe(Tag);
  });
});
