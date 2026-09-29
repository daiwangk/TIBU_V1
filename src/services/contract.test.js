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

  it('supabase exports every FUNCTION_NAMES entry as a function', () => {
    for (const name of FUNCTION_NAMES) {
      expect(typeof supabase[name], name).toBe('function');
    }
  });
});
