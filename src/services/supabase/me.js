import { AppError } from '../errors.js';
import { getSession } from './auth.js';
import { getSupabase } from './client.js';
import { mapSupabaseError } from './errors.js';

const PROFILE_COLUMNS = 'id, role, full_name, phone, avatar_url, home_locality, home_lat, home_lng, notify_digest';
const AVATAR_BUCKET = 'avatars';
const AVATAR_MAX_EDGE = 400;

/** CONTRACT `updateMe` fields → profile columns. `role` is deliberately absent. */
const PATCH_COLUMNS = {
  fullName: 'full_name',
  phone: 'phone',
  avatarUrl: 'avatar_url',
  homeLocality: 'home_locality',
  homeLat: 'home_lat',
  homeLng: 'home_lng',
  notifyDigest: 'notify_digest',
};

/**
 * @param {object} row profiles row
 * @param {string} email from the session
 * @returns {import('../contract.js').Profile}
 */
export function mapProfile(row, email) {
  return {
    id: String(row.id),
    email,
    role: row.role,
    fullName: String(row.full_name ?? ''),
    phone: row.phone ?? null,
    avatarUrl: row.avatar_url ?? null,
    homeLocality: row.home_locality ?? null,
    homeLat: row.home_lat ?? null,
    homeLng: row.home_lng ?? null,
    notifyDigest: row.notify_digest !== false,
  };
}

/**
 * Contract patch → column patch. Unknown keys (including `role`) are dropped, never forwarded.
 * Empty strings become null for the nullable text fields.
 *
 * @param {Record<string, unknown>} patch
 * @returns {Record<string, unknown>}
 */
export function toProfilePatch(patch = {}) {
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [key, column] of Object.entries(PATCH_COLUMNS)) {
    if (!Object.hasOwn(patch, key) || patch[key] === undefined) continue;
    const value = patch[key];
    out[column] = typeof value === 'string' && value.trim() === '' && key !== 'fullName' ? null : value;
  }
  return out;
}

/** Avatar object path — the policy in migration 0005 requires the first folder to be the user's id. */
export const avatarPath = (userId, uuid) => `${userId}/${uuid}.webp`;

/** @returns {Promise<NonNullable<import('../contract.js').Session>>} */
async function requireSession() {
  const session = await getSession();
  if (!session) throw new AppError('auth_required', 'Please log in to continue');
  return session;
}

/** @returns {Promise<import('../contract.js').Profile|null>} */
export async function getMe() {
  const session = await getSession();
  if (!session) return null;
  const { data, error } = await getSupabase()
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', session.userId)
    .maybeSingle();
  if (error) throw mapSupabaseError(error);
  return data ? mapProfile(data, session.email) : null;
}

/**
 * @param {Partial<Pick<import('../contract.js').Profile,
 *   'fullName'|'phone'|'avatarUrl'|'homeLocality'|'homeLat'|'homeLng'|'notifyDigest'>>} patch
 * @returns {Promise<import('../contract.js').Profile>}
 */
export async function updateMe(patch) {
  const session = await requireSession();
  const columns = toProfilePatch(patch);
  if (Object.keys(columns).length === 0) {
    const current = await getMe();
    if (!current) throw new AppError('not_found', "We couldn't find that");
    return current;
  }
  const { data, error } = await getSupabase()
    .from('profiles')
    .update(columns)
    .eq('id', session.userId)
    .select(PROFILE_COLUMNS)
    .single();
  if (error) throw mapSupabaseError(error);
  return mapProfile(data, session.email);
}

/**
 * Compress to a 400 px webp, store at `avatars/{userId}/<uuid>.webp`, save the public URL on the profile.
 *
 * @param {File} file
 * @returns {Promise<string>} public URL
 */
export async function uploadAvatar(file) {
  const session = await requireSession();
  // Loaded on demand: the compression library is large and only avatar uploads need it.
  const { compressImage } = await import('../../lib/image.js');
  const compressed = await compressImage(file, { maxEdge: AVATAR_MAX_EDGE });
  const path = avatarPath(session.userId, crypto.randomUUID());
  const storage = getSupabase().storage.from(AVATAR_BUCKET);

  const { error } = await storage.upload(path, compressed, { contentType: 'image/webp', upsert: false });
  if (error) throw mapSupabaseError(error);

  const { data } = storage.getPublicUrl(path);
  await updateMe({ avatarUrl: data.publicUrl });
  return data.publicUrl;
}
