import {
  CakeSlice,
  Droplets,
  Flame,
  Gem,
  Gift,
  Scissors,
  Shirt,
  Sparkles,
  Spool,
  Tag,
  UtensilsCrossed,
} from 'lucide-react';

/** @type {Record<string, import('react').ComponentType>} */
export const CATEGORY_ICONS = {
  desserts: CakeSlice,
  food: UtensilsCrossed,
  handmade: Scissors,
  crochet: Spool,
  embroidery: Shirt,
  'resin-art': Droplets,
  candles: Flame,
  fashion: Shirt,
  'womens-fashion': Sparkles,
  'mens-fashion': Shirt,
  jewellery: Gem,
  gifts: Gift,
};

/**
 * @param {string} slug
 * @returns {import('react').ComponentType}
 */
export function getCategoryIcon(slug) {
  return CATEGORY_ICONS[slug] ?? Tag;
}
