import { describe, expect, it } from 'vitest';
import { FUNCTION_NAMES } from './contract.js';
import * as mock from './mock/index.js';
import * as supabase from './supabase/index.js';

describe('service contract adapters', () => {
  it('mock exports every FUNCTION_NAMES entry as a function', () => {
    for (const name of FUNCTION_NAMES) {
      expect(typeof mock[name], name).toBe('function');
    }
  });

  it('includes resendConfirmation (v1.2.2), which mock rejects with unavailable_in_mock', async () => {
    expect(FUNCTION_NAMES).toContain('resendConfirmation');
    await expect(mock.resendConfirmation('a@b.co')).rejects.toMatchObject({ code: 'unavailable_in_mock' });
  });

  it('supabase exports every FUNCTION_NAMES entry as a function', () => {
    for (const name of FUNCTION_NAMES) {
      expect(typeof supabase[name], name).toBe('function');
    }
  });
});
