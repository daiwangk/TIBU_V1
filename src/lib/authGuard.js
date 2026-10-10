/**
 * `/login?next=<current path>` for a guest who hit a protected page.
 * @param {string} pathname
 * @param {string} [search]
 * @returns {string}
 */
export function loginRedirectPath(pathname, search = '') {
  return `/login?next=${encodeURIComponent(`${pathname}${search}`)}`;
}

/**
 * Whether `role` may pass a `roles` check. 'admin' passes every check.
 * @param {string|null|undefined} role
 * @param {string[]} roles
 * @returns {boolean}
 */
export function roleAllowed(role, roles) {
  if (!role) return false;
  return role === 'admin' || roles.includes(role);
}
