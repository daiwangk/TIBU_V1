import { describe, expect, it } from 'vitest';
import { AppError } from '../../services/errors.js';
import {
  ADMIN_TABS,
  allowedActions,
  decideErrorMessage,
  formatDate,
  groupByStatus,
  instagramUrl,
  mapsLink,
  parseStatusParam,
  validateReason,
} from './adminModel';

const row = (businessId, status) => ({ businessId, status, name: businessId });

describe('groupByStatus', () => {
  it('splits rows into the four tabs and keeps their order', () => {
    const groups = groupByStatus([
      row('a', 'pending'),
      row('b', 'approved'),
      row('c', 'pending'),
      row('d', 'rejected'),
      row('e', 'unpublished'),
    ]);
    expect(groups.pending.map((r) => r.businessId)).toEqual(['a', 'c']);
    expect(groups.approved.map((r) => r.businessId)).toEqual(['b']);
    expect(groups.rejected.map((r) => r.businessId)).toEqual(['d']);
    expect(groups.unpublished.map((r) => r.businessId)).toEqual(['e']);
  });

  it('leaves out drafts and unknown statuses', () => {
    const groups = groupByStatus([row('a', 'draft'), row('b', 'weird'), row('c', 'approved')]);
    const total = Object.values(groups).reduce((n, list) => n + list.length, 0);
    expect(total).toBe(1);
  });

  it('returns four empty tabs for no rows', () => {
    expect(groupByStatus([])).toEqual({ pending: [], approved: [], rejected: [], unpublished: [] });
    expect(groupByStatus(undefined)).toEqual({ pending: [], approved: [], rejected: [], unpublished: [] });
  });

  it('has a group for every tab', () => {
    const groups = groupByStatus([]);
    for (const tab of ADMIN_TABS) expect(groups[tab.status]).toEqual([]);
  });
});

describe('allowedActions', () => {
  const actionsOf = (status) => allowedActions(status).map((a) => a.action);

  it('follows the CONTRACT §7 transitions', () => {
    expect(actionsOf('pending')).toEqual(['approve', 'reject']);
    expect(actionsOf('approved')).toEqual(['unpublish']);
    expect(actionsOf('unpublished')).toEqual(['republish']);
  });

  it('labels the rejected → approved transition Approve but sends republish (adapter rule)', () => {
    const [only, ...rest] = allowedActions('rejected');
    expect(rest).toEqual([]);
    expect(only.action).toBe('republish');
    expect(only.label).toBe('Approve');
    expect(only.needsReason).toBe(false);
  });

  it('gives drafts and unknown statuses no actions', () => {
    expect(allowedActions('draft')).toEqual([]);
    expect(allowedActions('nope')).toEqual([]);
  });

  it('asks for a reason only for reject and unpublish', () => {
    const all = ['pending', 'approved', 'unpublished', 'rejected'].flatMap(allowedActions);
    const withReason = all.filter((a) => a.needsReason).map((a) => a.action);
    expect(withReason.sort()).toEqual(['reject', 'unpublish']);
  });
});

describe('validateReason', () => {
  it('needs at least 10 characters after trimming', () => {
    expect(validateReason('')).toMatch(/at least 10/);
    expect(validateReason('   short   ')).toMatch(/at least 10/);
    expect(validateReason('123456789')).toMatch(/at least 10/);
    expect(validateReason('1234567890')).toBeNull();
    expect(validateReason('  Logo is blurry  ')).toBeNull();
  });
});

describe('links', () => {
  it('builds a Google Maps link from both coordinates', () => {
    expect(mapsLink(19.083, 72.841)).toBe('https://www.google.com/maps/search/?api=1&query=19.083,72.841');
    expect(mapsLink(null, 72.8)).toBeNull();
    expect(mapsLink(19.1, null)).toBeNull();
  });

  it('builds an Instagram profile link', () => {
    expect(instagramUrl('rachna.makes')).toBe('https://instagram.com/rachna.makes');
    expect(instagramUrl('@rachna_makes')).toBe('https://instagram.com/rachna_makes');
    expect(instagramUrl('')).toBeNull();
    expect(instagramUrl(null)).toBeNull();
  });
});

describe('parseStatusParam', () => {
  it('accepts the four tabs and falls back to pending', () => {
    expect(parseStatusParam('approved')).toBe('approved');
    expect(parseStatusParam('unpublished')).toBe('unpublished');
    expect(parseStatusParam('draft')).toBe('pending');
    expect(parseStatusParam(null)).toBe('pending');
  });
});

describe('decideErrorMessage', () => {
  it('maps conflict, validation and not_found', () => {
    expect(decideErrorMessage(new AppError('conflict', 'x'))).toMatch(/changed meanwhile/);
    expect(decideErrorMessage(new AppError('validation', 'Add a reason'))).toBe('Add a reason');
    expect(decideErrorMessage(new AppError('not_found', 'x'))).toMatch(/couldn't find/);
    expect(decideErrorMessage(new AppError('auth_required', 'x'))).toBe('Please log in to continue');
    expect(decideErrorMessage(new Error('boom'))).toBe('Something went wrong');
  });
});

describe('formatDate', () => {
  it('shows day, month and year', () => {
    expect(formatDate('2026-10-12T10:00:00Z')).toBe('12 Oct 2026');
    expect(formatDate('nope')).toBe('');
  });
});
