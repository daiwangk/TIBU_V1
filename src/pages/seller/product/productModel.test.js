import { describe, expect, it } from 'vitest';
import { byCreated, formToProductInput, prefillDetails, productSchema, productToForm, productWithActive } from './productModel.js';

const business = { categorySlug: 'desserts', deliveryAvailable: true, pickupAvailable: false };

const okForm = {
  name: 'Vanilla cake',
  price: '1250',
  description: '',
  categorySlug: '',
  details: [],
  availableToday: false,
  isActive: true,
  deliveryMode: 'same',
  deliveryAvailable: true,
  pickupAvailable: false,
  deliveryTime: '',
};

describe('productSchema', () => {
  it('accepts a complete form', () => {
    expect(productSchema.safeParse(okForm).success).toBe(true);
  });

  it('needs a name of 2–100 characters', () => {
    expect(productSchema.safeParse({ ...okForm, name: 'A' }).success).toBe(false);
    expect(productSchema.safeParse({ ...okForm, name: 'x'.repeat(101) }).success).toBe(false);
  });

  it('takes a whole-rupee price from 0 to ₹10,00,000', () => {
    for (const price of ['0', '1', '1000000']) expect(productSchema.safeParse({ ...okForm, price }).success, price).toBe(true);
    for (const price of ['', '12.5', '-3', '1000001', 'abc', '1,250']) {
      expect(productSchema.safeParse({ ...okForm, price }).success, price).toBe(false);
    }
  });

  it('limits details to 12 rows, label 40, value 200', () => {
    const rows = (n) => Array.from({ length: n }, (_, i) => ({ label: `L${i}`, value: 'v' }));
    expect(productSchema.safeParse({ ...okForm, details: rows(12) }).success).toBe(true);
    expect(productSchema.safeParse({ ...okForm, details: rows(13) }).success).toBe(false);
    expect(productSchema.safeParse({ ...okForm, details: [{ label: 'x'.repeat(41), value: 'v' }] }).success).toBe(false);
    expect(productSchema.safeParse({ ...okForm, details: [{ label: 'x', value: 'v'.repeat(201) }] }).success).toBe(false);
  });

  it('caps the delivery time at 40 characters', () => {
    expect(productSchema.safeParse({ ...okForm, deliveryTime: 'x'.repeat(41) }).success).toBe(false);
  });
});

describe('formToProductInput', () => {
  it('turns the price into integer rupees and "same as my shop" into no override', () => {
    const input = formToProductInput({ ...okForm, deliveryTime: 'Same day' }, null);
    expect(input.price).toBe(1250);
    expect(input.deliveryOverride).toBeNull();
    expect(input.categorySlug).toBeNull();
    expect('id' in input).toBe(false);
  });

  it('carries the id when editing', () => {
    expect(formToProductInput(okForm, 'p1').id).toBe('p1');
  });

  it('drops detail rows that lack a label or a value', () => {
    const input = formToProductInput({
      ...okForm,
      details: [{ label: 'Weight', value: ' 500g ' }, { label: 'Serves', value: '' }, { label: '', value: 'x' }],
    });
    expect(input.details).toEqual([{ label: 'Weight', value: '500g' }]);
  });

  it('sends a custom override, using null for a blank time and ignoring the time when delivery is off', () => {
    const custom = { ...okForm, deliveryMode: 'custom', pickupAvailable: true };
    expect(formToProductInput({ ...custom, deliveryTime: '' }).deliveryOverride).toEqual({ deliveryAvailable: true, pickupAvailable: true, deliveryTime: null });
    expect(formToProductInput({ ...custom, deliveryTime: '2–3 days' }).deliveryOverride.deliveryTime).toBe('2–3 days');
    expect(formToProductInput({ ...custom, deliveryAvailable: false, deliveryTime: '2–3 days' }).deliveryOverride).toEqual({
      deliveryAvailable: false,
      pickupAvailable: true,
      deliveryTime: null,
    });
  });

  it('keeps a category override', () => {
    expect(formToProductInput({ ...okForm, categorySlug: 'candles' }).categorySlug).toBe('candles');
  });
});

describe('productToForm', () => {
  it('starts a blank form from the shop settings', () => {
    expect(productToForm(null, business)).toMatchObject({
      name: '',
      price: '',
      categorySlug: '',
      isActive: true,
      availableToday: false,
      deliveryMode: 'same',
      deliveryAvailable: true,
      pickupAvailable: false,
      deliveryTime: '',
      details: [],
    });
  });

  it('shows a saved product, with a category override only when it differs from the shop', () => {
    const product = {
      name: 'Pillar candle',
      price: 450,
      description: 'Soy wax',
      categorySlug: 'candles',
      details: [{ label: 'Burn time', value: '20 h' }],
      availableToday: true,
      isActive: false,
      deliveryOverride: { deliveryAvailable: false, pickupAvailable: true, deliveryTime: null },
    };
    expect(productToForm(product, business)).toMatchObject({
      price: '450',
      categorySlug: 'candles',
      isActive: false,
      availableToday: true,
      deliveryMode: 'custom',
      deliveryAvailable: false,
      pickupAvailable: true,
      deliveryTime: '',
      details: [{ label: 'Burn time', value: '20 h' }],
    });
    expect(productToForm({ ...product, categorySlug: 'desserts', deliveryOverride: null }, business)).toMatchObject({
      categorySlug: '',
      deliveryMode: 'same',
    });
  });
});

describe('prefillDetails', () => {
  const labels = ['Weight / Quantity', 'Serves'];

  it('prefills an empty list and an untouched template', () => {
    expect(prefillDetails([], labels)).toEqual([{ label: 'Weight / Quantity', value: '' }, { label: 'Serves', value: '' }]);
    expect(prefillDetails([{ label: 'Old', value: '' }], labels)).toHaveLength(2);
  });

  it('leaves rows alone once the seller has typed a value', () => {
    expect(prefillDetails([{ label: 'Weight', value: '500g' }], labels)).toBeNull();
  });

  it('returns no rows for a category without a template', () => {
    expect(prefillDetails([], [])).toEqual([]);
  });
});

describe('productWithActive', () => {
  const product = {
    id: 'p1',
    name: 'Pillar candle',
    price: 450,
    description: 'Soy wax',
    categorySlug: 'candles',
    details: [{ label: 'Burn time', value: '20 h' }],
    availableToday: true,
    isActive: true,
    deliveryOverride: { deliveryAvailable: false, pickupAvailable: true, deliveryTime: null },
  };

  it('changes only the active flag and keeps everything else saved', () => {
    const off = productWithActive(product, business, false);
    expect(off).toMatchObject({
      id: 'p1',
      name: 'Pillar candle',
      price: 450,
      description: 'Soy wax',
      categorySlug: 'candles',
      details: [{ label: 'Burn time', value: '20 h' }],
      availableToday: true,
      isActive: false,
      deliveryOverride: { deliveryAvailable: false, pickupAvailable: true, deliveryTime: null },
    });
    expect(productWithActive({ ...product, isActive: false }, business, true).isActive).toBe(true);
  });

  it('keeps "same as my shop" for category and delivery', () => {
    const input = productWithActive({ ...product, categorySlug: 'desserts', deliveryOverride: null }, business, false);
    expect(input.categorySlug).toBeNull();
    expect(input.deliveryOverride).toBeNull();
  });
});

describe('byCreated', () => {
  it('orders oldest first, with the id as a tiebreak, and tolerates a missing date', () => {
    const list = [{ id: 'b', createdAt: '2026-10-02' }, { id: 'a', createdAt: '2026-10-02' }, { id: 'c', createdAt: '2026-10-01' }, { id: 'd' }];
    expect(list.sort(byCreated).map((p) => p.id)).toEqual(['d', 'c', 'a', 'b']);
  });
});
