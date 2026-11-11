/**
 * Staging storage policy:
 * - Browser uploads are permitted only when explicitly connected to the local
 *   Firebase Storage Emulator.
 * - Hosted staging never uploads to the live Cloud Storage bucket.
 * - Live uploads require a separately reviewed policy change and are not
 *   enabled by a Vite environment flag.
 */

export const isFirebaseStorageEmulatorMode = (value: unknown): boolean =>
  value === 'true';

export const isFirebaseStorageEmulatorEnabled = (): boolean => {
  try {
    return isFirebaseStorageEmulatorMode(import.meta.env?.VITE_USE_FIREBASE_EMULATORS);
  } catch {
    return false;
  }
};

/** Profile-photo controls are enabled only for local emulator testing. */
export const isPhotoUploadEnabled = (): boolean =>
  isFirebaseStorageEmulatorEnabled();
