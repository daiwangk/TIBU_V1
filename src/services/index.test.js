import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('service adapter selection', () => {
  it.each([undefined, 'mock', 'invalid'])('rejects %s in production', async (value) => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_DATA_SOURCE', value);

    await expect(import('./index.js')).rejects.toThrow('VITE_DATA_SOURCE');
  });

  it('selects Supabase in production when explicitly configured', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_DATA_SOURCE', 'supabase');

    const { dataSource } = await import('./index.js');
    expect(dataSource).toBe('supabase');
  });

  it('defaults to mock outside production when the variable is unset', async () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('VITE_DATA_SOURCE', undefined);

    const { dataSource } = await import('./index.js');
    expect(dataSource).toBe('mock');
  });
});
