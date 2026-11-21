import type { UserAccount } from '../types/database';

/**
 * Controls administrator UI visibility using the role derived from the
 * currently authenticated Firebase ID token custom claim.
 * Firestore rules and privileged service actions independently enforce the claim.
 */
export function isAdminUser(user: UserAccount | null | undefined): boolean {
  return Boolean(user && user.role === 'admin');
}
