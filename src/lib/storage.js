/**
 * @returns {Storage|null}
 */
function getStorage() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function readJSON(key, fallback) {
  try {
    const raw = getStorage()?.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 * @returns {boolean}
 */
export function writeJSON(key, value) {
  try {
    const storage = getStorage();
    if (!storage) return false;
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 * @param {number} ms
 * @returns {boolean}
 */
export function setWithExpiry(key, value, ms) {
  return writeJSON(key, { value, expiresAt: Date.now() + Math.max(0, ms) });
}

/**
 * @template T
 * @param {string} key
 * @returns {T|null}
 */
export function getWithExpiry(key) {
  const entry = readJSON(key, null);
  if (!entry || typeof entry.expiresAt !== 'number' || entry.expiresAt <= Date.now()) {
    try {
      getStorage()?.removeItem(key);
    } catch {
      // Storage can be unavailable or blocked; absence remains a safe result.
    }
    return null;
  }

  return entry.value;
}
