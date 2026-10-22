/**
 * Unit tests for the pure validateTransition helper (admin.js).
 * No Supabase calls; Vitest only.
 */

import { describe, expect, it } from 'vitest';
import { validateTransition } from './admin.js';

describe('validateTransition', () => {
  // -----------------------------------------------------------------------
  // Allowed transitions (should NOT throw)
  // -----------------------------------------------------------------------
  describe('allowed transitions', () => {
    it('pending → approve (no reason required)', () => {
      expect(() => validateTransition('pending', 'approve', null)).not.toThrow();
    });

    it('pending → reject with reason', () => {
      expect(() =>
        validateTransition('pending', 'reject', 'Missing description'),
      ).not.toThrow();
    });

    it('approved → unpublish with reason', () => {
      expect(() =>
        validateTransition('approved', 'unpublish', 'Policy violation'),
      ).not.toThrow();
    });

    it('unpublished → republish (no reason required)', () => {
      expect(() =>
        validateTransition('unpublished', 'republish', null),
      ).not.toThrow();
    });

    it('rejected → republish (no reason required)', () => {
      expect(() =>
        validateTransition('rejected', 'republish', null),
      ).not.toThrow();
    });
  });

  // -----------------------------------------------------------------------
  // Invalid transitions → conflict
  // -----------------------------------------------------------------------
  describe('invalid transitions', () => {
    it('draft → approve is not allowed', () => {
      expect(() => validateTransition('draft', 'approve', null)).toThrow(
        expect.objectContaining({ code: 'conflict' }),
      );
    });

    it('pending → unpublish is not allowed', () => {
      expect(() =>
        validateTransition('pending', 'unpublish', 'reason'),
      ).toThrow(expect.objectContaining({ code: 'conflict' }));
    });

    it('approved → reject is not allowed', () => {
      expect(() =>
        validateTransition('approved', 'reject', 'reason'),
      ).toThrow(expect.objectContaining({ code: 'conflict' }));
    });

    it('approved → republish is not allowed', () => {
      expect(() =>
        validateTransition('approved', 'republish', null),
      ).toThrow(expect.objectContaining({ code: 'conflict' }));
    });

    it('rejected → unpublish is not allowed', () => {
      expect(() =>
        validateTransition('rejected', 'unpublish', 'reason'),
      ).toThrow(expect.objectContaining({ code: 'conflict' }));
    });

    it('unknown status → any action is not allowed', () => {
      expect(() =>
        validateTransition('nonexistent', 'approve', null),
      ).toThrow(expect.objectContaining({ code: 'conflict' }));
    });
  });

  // -----------------------------------------------------------------------
  // Missing reason → validation
  // -----------------------------------------------------------------------
  describe('reason validation', () => {
    it('reject without reason throws validation', () => {
      expect(() => validateTransition('pending', 'reject', null)).toThrow(
        expect.objectContaining({ code: 'validation' }),
      );
    });

    it('reject with empty-string reason throws validation', () => {
      expect(() => validateTransition('pending', 'reject', '   ')).toThrow(
        expect.objectContaining({ code: 'validation' }),
      );
    });

    it('unpublish without reason throws validation', () => {
      expect(() =>
        validateTransition('approved', 'unpublish', ''),
      ).toThrow(expect.objectContaining({ code: 'validation' }));
    });

    it('approve with no reason is fine (no reason required)', () => {
      expect(() => validateTransition('pending', 'approve', '')).not.toThrow();
    });

    it('republish with no reason is fine', () => {
      expect(() =>
        validateTransition('unpublished', 'republish', undefined),
      ).not.toThrow();
    });
  });
});
