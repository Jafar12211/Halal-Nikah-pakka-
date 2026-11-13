/**
 * Preserve existing Firebase custom claims when adding the staging admin role.
 * setCustomUserClaims replaces the entire claims object, so callers must merge.
 */
export function mergeAdminClaims(existingClaims = {}) {
  if (
    existingClaims === null
    || typeof existingClaims !== 'object'
    || Array.isArray(existingClaims)
  ) {
    throw new TypeError('Existing custom claims must be an object.');
  }

  return { ...existingClaims, admin: true };
}
