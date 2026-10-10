import { beforeEach, describe, expect, it, vi } from 'vitest';

const session = { userId: 'user-1', email: 'a@b.co' };
const getSession = vi.fn();
const compressImage = vi.fn();
const upload = vi.fn();
const getPublicUrl = vi.fn();
const single = vi.fn();
const update = vi.fn();
const eq = vi.fn();
const select = vi.fn();
const maybeSingle = vi.fn();
const from = vi.fn();

vi.mock('./auth.js', () => ({ getSession: (...a) => getSession(...a) }));
vi.mock('../../lib/image.js', () => ({ compressImage: (...a) => compressImage(...a) }));
vi.mock('./client.js', () => ({
  getSupabase: () => ({ from, storage: { from: () => ({ upload, getPublicUrl }) } }),
}));

const { avatarPath, getMe, mapProfile, toProfilePatch, updateMe, uploadAvatar } = await import('./me.js');

const ROW = {
  id: 'user-1', role: 'customer', full_name: 'Asha', phone: null, avatar_url: null,
  home_locality: null, home_lat: null, home_lng: null, notify_digest: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  getSession.mockResolvedValue(session);
  // from('profiles').select().eq().maybeSingle()  and  .update().eq().select().single()
  const chain = { select, update, eq, maybeSingle, single };
  from.mockReturnValue(chain);
  select.mockReturnValue(chain);
  update.mockReturnValue(chain);
  eq.mockReturnValue(chain);
  maybeSingle.mockResolvedValue({ data: ROW, error: null });
  single.mockResolvedValue({ data: ROW, error: null });
});

describe('toProfilePatch', () => {
  it('maps the contract fields to columns and drops role and unknown keys', () => {
    expect(toProfilePatch({
      fullName: 'Asha', phone: '9876543210', avatarUrl: 'u', homeLocality: 'Bandra West',
      homeLat: 19.05, homeLng: 72.83, notifyDigest: false,
      role: 'admin', id: 'other', email: 'x@y.z',
    })).toEqual({
      full_name: 'Asha', phone: '9876543210', avatar_url: 'u', home_locality: 'Bandra West',
      home_lat: 19.05, home_lng: 72.83, notify_digest: false,
    });
  });

  it('turns blank optional text into null but keeps the name as typed', () => {
    expect(toProfilePatch({ phone: '  ', homeLocality: '' })).toEqual({ phone: null, home_locality: null });
    expect(toProfilePatch({ fullName: '' })).toEqual({ full_name: '' });
  });
});

describe('profile reads and writes', () => {
  it('mapProfile returns the contract shape', () => {
    expect(mapProfile(ROW, 'a@b.co')).toEqual({
      id: 'user-1', email: 'a@b.co', role: 'customer', fullName: 'Asha', phone: null, avatarUrl: null,
      homeLocality: null, homeLat: null, homeLng: null, notifyDigest: true,
    });
  });

  it('getMe is null for a guest and reads the own row otherwise', async () => {
    getSession.mockResolvedValueOnce(null);
    await expect(getMe()).resolves.toBeNull();
    await expect(getMe()).resolves.toMatchObject({ id: 'user-1', email: 'a@b.co' });
    expect(eq).toHaveBeenCalledWith('id', 'user-1');
  });

  it('updateMe never sends role', async () => {
    await updateMe({ fullName: 'New', role: 'admin' });
    expect(update).toHaveBeenCalledWith({ full_name: 'New' });
  });

  it('updateMe needs a login', async () => {
    getSession.mockResolvedValue(null);
    await expect(updateMe({ fullName: 'x' })).rejects.toMatchObject({ code: 'auth_required' });
  });
});

describe('uploadAvatar', () => {
  it('avatarPath is {userId}/{uuid}.webp', () => {
    expect(avatarPath('user-1', 'abc')).toBe('user-1/abc.webp');
  });

  it('compresses to 400 px, uploads to avatars/{userId}/<uuid>.webp and saves the url', async () => {
    const blob = new Blob(['x'], { type: 'image/webp' });
    compressImage.mockResolvedValue(blob);
    upload.mockResolvedValue({ error: null });
    getPublicUrl.mockImplementation((path) => ({ data: { publicUrl: `https://cdn.test/avatars/${path}` } }));

    const url = await uploadAvatar(new File(['raw'], 'me.png', { type: 'image/png' }));

    expect(compressImage).toHaveBeenCalledWith(expect.anything(), { maxEdge: 400 });
    const [path, body, options] = upload.mock.calls[0];
    expect(path).toMatch(/^user-1\/[0-9a-f-]{36}\.webp$/);
    expect(body).toBe(blob);
    expect(options).toMatchObject({ contentType: 'image/webp', upsert: false });
    expect(url).toBe(`https://cdn.test/avatars/${path}`);
    expect(update).toHaveBeenCalledWith({ avatar_url: url });
  });

  it('maps a failed upload and does not touch the profile', async () => {
    compressImage.mockResolvedValue(new Blob(['x']));
    upload.mockResolvedValue({ error: { message: 'new row violates row-level security policy' } });
    await expect(uploadAvatar(new File(['raw'], 'me.png'))).rejects.toMatchObject({ code: 'forbidden' });
    expect(update).not.toHaveBeenCalled();
  });
});
