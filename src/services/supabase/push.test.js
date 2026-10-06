import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSupabaseMock } = vi.hoisted(() => ({ getSupabaseMock: vi.fn() }));

vi.mock('./client.js', () => ({ getSupabase: getSupabaseMock }));

import { deletePushSubscription, savePushSubscription } from './push.js';

describe('push subscription RPCs', () => {
  let rpc;

  beforeEach(() => {
    rpc = vi.fn(async () => ({ data: null, error: null }));
    getSupabaseMock.mockReturnValue({ rpc });
    vi.stubGlobal('navigator', { userAgent: 'TestBrowser/1.0' });
  });

  it('save_push_subscription gets the endpoint, keys and the user agent', async () => {
    await savePushSubscription({ endpoint: 'https://push.example/abc', p256dh: 'pk', auth: 'secret' });
    expect(rpc).toHaveBeenCalledWith('save_push_subscription', {
      p_endpoint: 'https://push.example/abc',
      p_p256dh: 'pk',
      p_auth: 'secret',
      p_user_agent: 'TestBrowser/1.0',
    });
  });

  it('delete_push_subscription gets only the endpoint', async () => {
    await deletePushSubscription('https://push.example/abc');
    expect(rpc).toHaveBeenCalledWith('delete_push_subscription', { p_endpoint: 'https://push.example/abc' });
  });

  it('maps login_required to auth_required', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: 'login_required', code: '28000' } });
    await expect(
      savePushSubscription({ endpoint: 'https://push.example/abc', p256dh: 'pk', auth: 'secret' }),
    ).rejects.toMatchObject({ code: 'auth_required' });
  });

  it('maps other database errors through the shared error mapper', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: 'rate_limited', code: '53400' } });
    await expect(deletePushSubscription('https://push.example/abc')).rejects.toMatchObject({
      code: 'rate_limited',
    });
  });
});
