import { describe, expect, it } from 'vitest';
import { connectedLabel, parseSavedTab, saveGateAction, stillSaved, viewedLabel } from './savedHelpers.js';

const now = new Date('2026-10-15T12:00:00.000Z');

describe('saveGateAction', () => {
  it('always asks to save (saved: true)', () => {
    expect(saveGateAction('product', 'p1', '/p/p1')).toEqual({
      type: 'save',
      payload: { kind: 'product', id: 'p1', saved: true },
      returnTo: '/p/p1',
    });
  });
});

describe('parseSavedTab', () => {
  it('defaults to products', () => {
    expect(parseSavedTab(null)).toBe('products');
    expect(parseSavedTab('nope')).toBe('products');
    expect(parseSavedTab('businesses')).toBe('businesses');
  });
});

describe('stillSaved', () => {
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  it('drops items no longer in the id-set (optimistic unsave)', () => {
    expect(stillSaved(items, ['a', 'c'])).toEqual([{ id: 'a' }, { id: 'c' }]);
  });

  it('keeps the list order and shows everything before the id-set loads', () => {
    expect(stillSaved(items, undefined)).toEqual(items);
    expect(stillSaved(undefined, ['a'])).toEqual([]);
  });
});

describe('labels', () => {
  it('formats viewed and connected times', () => {
    expect(viewedLabel('2026-10-15T10:00:00.000Z', now)).toBe('Viewed 2 h ago');
    expect(viewedLabel(null, now)).toBeNull();
    expect(connectedLabel('whatsapp', '2026-10-12T12:00:00.000Z', now)).toBe('WhatsApp · 3 d ago');
    expect(connectedLabel('call', '2026-10-15T11:59:50.000Z', now)).toBe('Call · just now');
  });
});
