import { describe, expect, it } from 'vitest';
import { businessToInput, clampStep, firstIncompleteStep, groupLeafCategories, isStepComplete } from './onboardingModel.js';

const base = {
  name: 'Sweet Crumbs',
  description: 'Home-baked cakes',
  categorySlug: 'desserts',
  addressText: '',
  locality: 'Bandra West',
  city: 'Mumbai',
  lat: 19.059,
  lng: 72.829,
  instagramHandle: 'sweetcrumbs',
  deliveryAvailable: true,
  pickupAvailable: false,
  deliveryTime: 'Same day',
  establishedYear: 2019,
  contacts: { phone: '9876543210', whatsapp: '9876543210' },
  logoUrl: null,
  products: [],
  status: 'draft',
};

describe('step completeness and resume', () => {
  it('starts at step 1 with no business, and for a draft with only a name', () => {
    expect(firstIncompleteStep(null)).toBe(1);
    expect(firstIncompleteStep({ ...base, categorySlug: '', description: '' })).toBe(1);
  });

  it('resumes at the first incomplete step', () => {
    expect(firstIncompleteStep({ ...base, lat: null, lng: null })).toBe(2);
    expect(firstIncompleteStep({ ...base, locality: '' })).toBe(2);
    expect(firstIncompleteStep({ ...base, contacts: null })).toBe(3);
    expect(firstIncompleteStep({ ...base, instagramHandle: null })).toBe(3);
    expect(firstIncompleteStep(base)).toBe(4);
  });

  it('counts a logo and an active product with an image as steps 4 and 5; videos are optional', () => {
    const withLogo = { ...base, logoUrl: 'https://x/logo.webp' };
    expect(firstIncompleteStep(withLogo)).toBe(5);
    const product = { isActive: true, images: [{ id: 'i', url: 'u' }] };
    expect(firstIncompleteStep({ ...withLogo, products: [product] })).toBe(7);
    expect(isStepComplete(5, { ...withLogo, products: [{ isActive: false, images: [{}] }] })).toBe(false);
    expect(isStepComplete(6, base)).toBe(true);
  });

  it('treats a submitted business as finished', () => {
    expect(isStepComplete(7, { ...base, status: 'pending' })).toBe(true);
    expect(isStepComplete(7, base)).toBe(false);
  });
});

describe('clampStep', () => {
  it('uses the first incomplete step when ?step= is missing or junk', () => {
    for (const raw of [null, undefined, '', 'abc', '2.5', '-1']) {
      expect(clampStep(raw, { ...base, contacts: null }), String(raw)).toBe(3);
    }
  });

  it('lets earlier steps be revisited but not later ones be skipped to', () => {
    const draft = { ...base, contacts: null };
    expect(clampStep('1', draft)).toBe(1);
    expect(clampStep('3', draft)).toBe(3);
    expect(clampStep('6', draft)).toBe(3);
    expect(clampStep('0', draft)).toBe(1);
    expect(clampStep('3', null)).toBe(1);
  });
});

describe('businessToInput', () => {
  it('maps a saved business to a full BusinessInput', () => {
    expect(businessToInput(base)).toEqual({
      name: 'Sweet Crumbs',
      description: 'Home-baked cakes',
      categorySlug: 'desserts',
      addressText: '',
      locality: 'Bandra West',
      city: 'Mumbai',
      lat: 19.059,
      lng: 72.829,
      instagramHandle: 'sweetcrumbs',
      deliveryAvailable: true,
      pickupAvailable: false,
      deliveryTime: 'Same day',
      establishedYear: 2019,
    });
  });

  it('gives a complete input even with no business yet', () => {
    expect(businessToInput(null)).toMatchObject({
      name: '',
      city: 'Mumbai',
      lat: null,
      lng: null,
      deliveryAvailable: false,
      deliveryTime: null,
      establishedYear: null,
    });
  });
});

describe('groupLeafCategories', () => {
  const cat = (slug, parentSlug = null, sortOrder = 0) => ({ slug, name: slug, parentSlug, sortOrder });
  const categories = [
    cat('handmade', null, 3),
    cat('crochet', 'handmade', 1),
    cat('candles', 'handmade', 2),
    cat('desserts', null, 1),
    cat('fashion', null, 4),
    cat('womens-fashion', 'fashion', 1),
  ];

  it('groups parents that have children and lists the rest on their own, so parents are never selectable', () => {
    const { groups, singles } = groupLeafCategories(categories);
    expect(singles.map((c) => c.slug)).toEqual(['desserts']);
    expect(groups.map((g) => g.parent.slug)).toEqual(['handmade', 'fashion']);
    expect(groups[0].children.map((c) => c.slug)).toEqual(['crochet', 'candles']);
  });
});
