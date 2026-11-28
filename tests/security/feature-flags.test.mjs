import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isFileUploadEnabled,
  isPhotoUploadEnabled,
  isFirebaseStorageEmulatorMode,
  isCloudAccountDeletionEnabled,
} from "../../src/utils/featureFlags.ts";

test("emulator mode accepts only the explicit true string", () => {
  assert.equal(isFirebaseStorageEmulatorMode("true"), true);
  assert.equal(isFirebaseStorageEmulatorMode("false"), false);
  assert.equal(isFirebaseStorageEmulatorMode(undefined), false);
  assert.equal(isFirebaseStorageEmulatorMode(true), false);
});

test("hosted builds disable new media uploads unless local emulators are enabled", () => {
  assert.equal(isFileUploadEnabled(), false);
  assert.equal(isPhotoUploadEnabled(), false);
});

test("cloud account deletion stays disabled unless its backend is explicitly enabled", () => {
  assert.equal(isCloudAccountDeletionEnabled(), false);
});
