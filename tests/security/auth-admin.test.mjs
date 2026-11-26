import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

test("all admin authorization layers require the Firebase custom claim", () => {
  const app = readFileSync(new URL("../../src/App.tsx", import.meta.url), "utf8");
  const firestoreService = readFileSync(new URL("../../src/services/firestoreService.ts", import.meta.url), "utf8");
  const firestoreRules = readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8");
  const storageRules = readFileSync(new URL("../../storage.rules", import.meta.url), "utf8");

  assert.match(app, /token\.claims\.admin === true/);
  assert.match(firestoreService, /token\.claims\.admin === true/);
  assert.match(firestoreRules, /function admin\(\)\s*\{\s*return signedIn\(\)\s*&&\s*request\.auth\.token\.get\('admin', false\) == true;/);
  assert.match(storageRules, /function admin\(\)\s*\{\s*return signedIn\(\)\s*&&\s*request\.auth\.token\.get\('admin', false\) == true;/);

  for (const source of [app, firestoreService, firestoreRules, storageRules]) {
    assert.doesNotMatch(source, /jafarmd0007@gmail\.com/);
  }
});

import { isAdminUser } from "../../src/utils/admin.ts";

test("isAdminUser correctly identifies admin by role claim only", () => {
  assert.equal(isAdminUser(null), false);
  assert.equal(isAdminUser(undefined), false);
  assert.equal(isAdminUser({ role: "member", email: "user@example.com" }), false);
  assert.equal(isAdminUser({ role: "member", email: "jafarmd0007@gmail.com" }), false);
  assert.equal(isAdminUser({ role: "admin", email: "jafarmd0007@gmail.com" }), true);
  assert.equal(isAdminUser({ role: "admin", email: "another-admin@example.com" }), true);
});
