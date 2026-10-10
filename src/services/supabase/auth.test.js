import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  onAuthStateChange: vi.fn(),
};

vi.mock('./client.js', () => ({ getSupabase: () => ({ auth }) }));

const {
  getSession, onAuthChange, sendPasswordReset, signIn, signOut, signUp, toSession, updatePassword,
} = await import('./auth.js');

const ORIGIN = 'https://tibu-app.pages.dev';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('VITE_SITE_URL', `${ORIGIN}/`);
});

describe('signUp', () => {
  it('defaults signup_as to customer', async () => {
    auth.signUp.mockResolvedValue({ data: { user: { identities: [{}] }, session: null }, error: null });
    await signUp({ email: 'a@b.co', password: 'secret123', fullName: 'Asha' });
    expect(auth.signUp).toHaveBeenCalledWith({
      email: 'a@b.co',
      password: 'secret123',
      options: { data: { full_name: 'Asha', signup_as: 'customer' }, emailRedirectTo: `${ORIGIN}/auth/callback` },
    });
  });

  it('passes seller through, and treats any other value as customer', async () => {
    auth.signUp.mockResolvedValue({ data: { user: { identities: [{}] }, session: null }, error: null });
    await signUp({ email: 'a@b.co', password: 'x', fullName: 'S', signupAs: 'seller' });
    expect(auth.signUp.mock.calls[0][0].options.data.signup_as).toBe('seller');
    await signUp({ email: 'a@b.co', password: 'x', fullName: 'S', signupAs: 'admin' });
    expect(auth.signUp.mock.calls[1][0].options.data.signup_as).toBe('customer');
  });

  it('reports whether e-mail confirmation is needed', async () => {
    auth.signUp.mockResolvedValueOnce({ data: { user: { identities: [{}] }, session: null }, error: null });
    await expect(signUp({ email: 'a@b.co', password: 'x', fullName: 'A' })).resolves.toEqual({ needsEmailConfirmation: true });
    auth.signUp.mockResolvedValueOnce({ data: { user: { identities: [{}] }, session: { user: { id: 'u' } } }, error: null });
    await expect(signUp({ email: 'a@b.co', password: 'x', fullName: 'A' })).resolves.toEqual({ needsEmailConfirmation: false });
  });

  it('maps an existing address (user with no identities) to a conflict', async () => {
    auth.signUp.mockResolvedValue({ data: { user: { identities: [] }, session: null }, error: null });
    await expect(signUp({ email: 'a@b.co', password: 'x', fullName: 'A' })).rejects.toMatchObject({
      code: 'conflict',
      message: 'An account with this email already exists',
    });
  });

  it('maps service errors', async () => {
    auth.signUp.mockResolvedValue({ data: {}, error: { code: 'weak_password', message: 'weak', status: 422 } });
    await expect(signUp({ email: 'a@b.co', password: 'x', fullName: 'A' })).rejects.toMatchObject({ code: 'validation' });
  });
});

describe('sign in, out, reset', () => {
  it('signIn returns the contract session and maps wrong passwords', async () => {
    auth.signInWithPassword.mockResolvedValueOnce({ data: { session: { user: { id: 'u1', email: 'a@b.co' } } }, error: null });
    await expect(signIn({ email: 'a@b.co', password: 'x' })).resolves.toEqual({ userId: 'u1', email: 'a@b.co' });
    auth.signInWithPassword.mockResolvedValueOnce({ data: {}, error: { code: 'invalid_credentials', message: 'Invalid login credentials' } });
    await expect(signIn({ email: 'a@b.co', password: 'bad' })).rejects.toMatchObject({
      code: 'validation',
      message: 'Email or password is incorrect',
    });
  });

  it('signOut maps errors', async () => {
    auth.signOut.mockResolvedValueOnce({ error: null });
    await expect(signOut()).resolves.toBeUndefined();
    auth.signOut.mockResolvedValueOnce({ error: { message: 'Failed to fetch' } });
    await expect(signOut()).rejects.toMatchObject({ code: 'network' });
  });

  it('sendPasswordReset redirects to /reset-password', async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    await sendPasswordReset('a@b.co');
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('a@b.co', { redirectTo: `${ORIGIN}/reset-password` });
  });

  it('updatePassword sends the new password', async () => {
    auth.updateUser.mockResolvedValue({ error: null });
    await updatePassword('new-secret');
    expect(auth.updateUser).toHaveBeenCalledWith({ password: 'new-secret' });
  });
});

describe('session helpers', () => {
  it('toSession keeps only id and email', () => {
    expect(toSession({ user: { id: 'u', email: 'a@b.co', role: 'authenticated' }, access_token: 't' }))
      .toEqual({ userId: 'u', email: 'a@b.co' });
    expect(toSession(null)).toBeNull();
    expect(toSession({})).toBeNull();
  });

  it('getSession returns null for a guest', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    await expect(getSession()).resolves.toBeNull();
  });

  it('onAuthChange passes (session, event) and returns an unsubscribe', () => {
    const unsubscribe = vi.fn();
    auth.onAuthStateChange.mockImplementation((cb) => {
      cb('SIGNED_OUT', null);
      return { data: { subscription: { unsubscribe } } };
    });
    const seen = [];
    const stop = onAuthChange((session, event) => seen.push([session, event]));
    expect(seen).toEqual([[null, 'SIGNED_OUT']]);
    stop();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
