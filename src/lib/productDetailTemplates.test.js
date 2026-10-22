import { describe, expect, it } from 'vitest';
import { isFashionCategory, templateFor } from './productDetailTemplates.js';

describe('templateFor', () => {
  it('gives a parent category its own list (D36)', () => {
    expect(templateFor('desserts')).toEqual(['Weight / Quantity', 'Serves', 'Shelf life', 'Veg / Eggless']);
    expect(templateFor('food')).toEqual(templateFor('desserts'));
    expect(templateFor('fashion')).toEqual(['Sizes available', 'Size chart', 'Fabric', 'Fit']);
    expect(templateFor('jewellery')).toEqual(['Material', 'Size']);
    expect(templateFor('gifts')).toEqual(["What's included", 'Personalisation']);
  });

  it('falls back to the parent list for a child category', () => {
    expect(templateFor('womens-fashion')).toEqual(templateFor('fashion'));
    expect(templateFor('mens-fashion')).toEqual(templateFor('fashion'));
    for (const slug of ['crochet', 'embroidery', 'resin-art']) {
      expect(templateFor(slug), slug).toEqual(['Dimensions', 'Material', 'Made to order']);
    }
  });

  it('lets a child have its own list (candles)', () => {
    expect(templateFor('candles')).toEqual(['Burn time', 'Wax', 'Fragrance']);
  });

  it('returns nothing for an unknown or missing slug', () => {
    for (const slug of ['nope', '', null, undefined]) expect(templateFor(slug), String(slug)).toEqual([]);
  });

  it('returns a copy, so a caller cannot change the template', () => {
    templateFor('desserts').push('x');
    expect(templateFor('desserts')).toHaveLength(4);
  });

  it('keeps every label within the 40-character limit', () => {
    for (const slug of ['desserts', 'fashion', 'jewellery', 'handmade', 'candles', 'gifts']) {
      for (const label of templateFor(slug)) expect(label.length, label).toBeLessThanOrEqual(40);
    }
  });
});

describe('isFashionCategory', () => {
  it('is true for fashion and its children only', () => {
    for (const slug of ['fashion', 'womens-fashion', 'mens-fashion']) expect(isFashionCategory(slug), slug).toBe(true);
    for (const slug of ['jewellery', 'desserts', 'crochet', '', null]) expect(isFashionCategory(slug), String(slug)).toBe(false);
  });
});
