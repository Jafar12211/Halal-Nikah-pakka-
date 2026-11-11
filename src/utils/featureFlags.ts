/**
 * Feature Flags for Nikah Pakka Application
 *
 * Safe defaults (fail-closed):
 * - Live photo uploads are disabled by default in staging (no-billing / Spark plan).
 * - Only enabled when explicitly set to 'true'.
 */

export const isPhotoUploadEnabled = (): boolean => {
  // Fail-closed: returns false unless VITE_ENABLE_LIVE_PHOTO_UPLOADS is explicitly 'true'
  try {
    const envVal = typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_ENABLE_LIVE_PHOTO_UPLOADS
      : (typeof process !== 'undefined' && process.env ? process.env.VITE_ENABLE_LIVE_PHOTO_UPLOADS : undefined);
    return envVal === 'true';
  } catch {
    return false;
  }
};
