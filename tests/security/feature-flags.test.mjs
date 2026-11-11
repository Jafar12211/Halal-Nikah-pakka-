import assert from "node:assert/strict";
import { test } from "node:test";
import { isPhotoUploadEnabled } from "../../src/utils/featureFlags.ts";

test("isPhotoUploadEnabled fails closed when env is not explicitly 'true'", () => {
  assert.equal(isPhotoUploadEnabled(), false);
});
