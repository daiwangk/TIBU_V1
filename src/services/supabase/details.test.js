import { describe, it, expect } from 'vitest';
import { detailsFromDb, detailsToDb, humanizeKey, DETAILS_MAX_ROWS } from './details.js';

describe('product details mapping', () => {
  it('reads the seed object form with readable labels', () => {
    expect(detailsFromDb({ weight: '500g', shelf_life: '10 days', spice_level: 'Medium' })).toEqual([
      { label: 'Weight', value: '500g' },
      { label: 'Shelf life', value: '10 days' },
      { label: 'Spice level', value: 'Medium' },
    ]);
  });
  it('reads the array form and keeps order', () => {
    const rows = [{ label: 'Size chart (M)', value: 'Chest 38 in' }, { label: 'Fabric', value: 'Cotton' }];
    expect(detailsFromDb(rows)).toEqual(rows);
  });
  it('drops empty rows and handles null / {} / garbage', () => {
    expect(detailsFromDb({ weight: '', serves: '4' })).toEqual([{ label: 'Serves', value: '4' }]);
    expect(detailsFromDb(null)).toEqual([]);
    expect(detailsFromDb({})).toEqual([]);
    expect(detailsFromDb('x')).toEqual([]);
    expect(detailsFromDb([{ label: 'A' }, null])).toEqual([]);
  });
  it('writes trimmed, capped array form', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ label: ` L${i} `, value: ` v${i} ` }));
    const out = detailsToDb(many);
    expect(out).toHaveLength(DETAILS_MAX_ROWS);
    expect(out[0]).toEqual({ label: 'L0', value: 'v0' });
    expect(detailsToDb([{ label: 'x'.repeat(60), value: 'y' }])[0].label).toHaveLength(40);
    expect(detailsToDb(undefined)).toEqual([]);
  });
  it('humanizes keys', () => {
    expect(humanizeKey('burn_time')).toBe('Burn time');
    expect(humanizeKey('PIECES')).toBe('Pieces');
  });
});
