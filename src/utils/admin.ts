import type { UserAccount } from '../types/database';

/**
 * Controls administrator UI visibility for the single configured admin account.
 * This is only a presentation fallback; Firestore rules and service actions
 * still require the Firebase Auth custom claim { admin: true }.
 */
const PRIMARY_ADMIN_UID = 'eZqLiU7wHxdxcAhGwxaOOvc7Y8G2';

export function isAdminUser(user: UserAccount | null | undefined): boolean {
  return Boolean(user && (user.role === 'admin' || user.id === PRIMARY_ADMIN_UID));
}
